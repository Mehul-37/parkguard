import React, { useState, useEffect, useRef, useCallback } from 'react';

const MapEditor = ({ selectedSite }) => {
    const [mapData, setMapData] = useState({ slots: [], nodes: [], lanes: [] });
    const [activeTool, setActiveTool] = useState('rect'); // 'rect', 'wand', 'lane', 'entry'
    const [drawing, setDrawing] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 }); // Refs used for drag logic, this is for UI feedback if needed
    const [currentRect, setCurrentRect] = useState(null);
    const [isConfiguringMap, setIsConfiguringMap] = useState(false);
    const [imageUrlInput, setImageUrlInput] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    // Lane Drawing State
    const [selectedNodeId, setSelectedNodeId] = useState(null); // For connecting lanes

    // Refs
    const startPosRef = useRef({ x: 0, y: 0 });
    const imgRef = useRef(null);
    const containerRef = useRef(null);
    const drawingRef = useRef(false);

    useEffect(() => {
        drawingRef.current = drawing;
    }, [drawing]);

    // Load Data
    useEffect(() => {
        if (!selectedSite) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        // Load config (slots + lanes + nodes)
        const loadMapData = async () => {
            try {
                const saved = localStorage.getItem(`parkguard_map_config_${selectedSite.id}`);
                if (saved) {
                    const parsed = JSON.parse(saved);

                    // Validate structure
                    const sanitary = {
                        slots: Array.isArray(parsed) ? parsed : (Array.isArray(parsed?.slots) ? parsed.slots : []),
                        nodes: Array.isArray(parsed?.nodes) ? parsed.nodes : [],
                        lanes: Array.isArray(parsed?.lanes) ? parsed.lanes : []
                    };

                    setMapData(sanitary);
                    setIsLoading(false);
                } else {
                    throw new Error("No local config found");
                }
            } catch (err) {
                console.warn("Map Config Load Error/Empty, falling back to backend/defaults:", err);
                // Fallback fetch slots from backend
                try {
                    const res = await fetch(`http://localhost:8000/slots?site_id=${selectedSite.id}`);
                    const data = await res.json();
                    const slots = Array.isArray(data) ? data : [];
                    setMapData({ slots, nodes: [], lanes: [] });
                } catch (e) {
                    console.error("Backend fetch error:", e);
                    setMapData({ slots: [], nodes: [], lanes: [] });
                }
                setIsLoading(false);
            }
        };

        loadMapData();
        setImageUrlInput(selectedSite?.image_url || "");
    }, [selectedSite]);

    const saveMapData = (newData) => {
        setMapData(newData);
        if (!selectedSite) return;
        localStorage.setItem(`parkguard_map_config_${selectedSite.id}`, JSON.stringify(newData));

        // Save slots to Backend (only slots, not nodes/lanes for now)
        fetch(`http://localhost:8000/slots?site_id=${selectedSite.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newData.slots),
        })
            .then(res => res.json())
            .then(data => console.log("Slots Saved to Backend:", data))
            .catch(err => console.error("Failed to save slots to backend:", err));

        // Save Entry Point if exists
        const entryNode = newData.nodes.find(n => n.is_entry);
        if (entryNode) {
            fetch(`http://localhost:8000/sites/${selectedSite.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    entry_x: entryNode.x,
                    entry_y: entryNode.y
                })
            })
                .then(res => res.json())
                .then(data => console.log("Entry Point Saved:", data))
                .catch(err => console.error("Failed to save entry point:", err));
        }
    };

    const handleSaveImageParams = async (overrideUrl = null) => {
        if (!selectedSite) return;
        const finalUrl = overrideUrl !== null ? overrideUrl : imageUrlInput;

        try {
            const res = await fetch(`http://localhost:8000/sites/${selectedSite.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image_url: finalUrl })
            });
            if (res.ok) {
                if (overrideUrl) setImageUrlInput(overrideUrl);
                alert("Map image updated! Please refresh.");
                setIsConfiguringMap(false);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => setImageUrlInput(reader.result);
        reader.readAsDataURL(file);
    };

    const handleResetImage = () => {
        const defaultUrl = selectedSite.id.includes('site2') ? "/parking-layout-airport.png" : "/parking-layout.png";
        if (window.confirm("Reset map image to default?")) handleSaveImageParams(defaultUrl);
    };

    // --- COORDINATE HELPERS ---
    const getPercentageCoords = (e) => {
        if (!containerRef.current) return { x: 0, y: 0 };
        const rect = containerRef.current.getBoundingClientRect();
        let pixelX = e.clientX - rect.left;
        let pixelY = e.clientY - rect.top;
        pixelX = Math.max(0, Math.min(pixelX, rect.width));
        pixelY = Math.max(0, Math.min(pixelY, rect.height));

        return {
            x: (pixelX / rect.width) * 100,
            y: (pixelY / rect.height) * 100,
            // Also return raw pixels for Magic Wand
            pixelX, pixelY,
            width: rect.width, height: rect.height
        };
    };

    // --- MAGIC WAND LOGIC ---
    const performMagicWand = (coords) => {
        if (!imgRef.current) return;

        // 1. Draw image to hidden canvas to read pixels
        const canvas = document.createElement('canvas'); // Create dynamic canvas
        const ctx = canvas.getContext('2d');
        const img = imgRef.current;

        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);

        // Scale click coords to image natural size
        const scaleX = img.naturalWidth / coords.width;
        const scaleY = img.naturalHeight / coords.height;
        // Use raw pixels relative to image size
        // const startX = Math.floor(coords.pixelX * scaleX);
        // const startY = Math.floor(coords.pixelY * scaleY);

        try {
            // const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            // For now, simulate detection

            const w = 2.5; // Approx 2.5% width
            const h = 4; // Approx 4% height
            // Center it
            const x = Math.max(0, coords.x - w / 2);
            const y = Math.max(0, coords.y - h / 2);

            const id = prompt("Magic Wand Detected Slot. Confirm ID:", `S-${Date.now().toString().slice(-4)}`);
            if (id) {
                const newSlot = {
                    id,
                    x: x + '%', y: y + '%', width: w + '%', height: h + '%',
                    occupied: false, sensor_status: 'EMPTY', site_id: selectedSite?.id
                };
                saveMapData({ ...mapData, slots: [...mapData.slots, newSlot] });
            }

        } catch (e) {
            console.error(e);
            alert("Cannot read image data. Using fallback dimensions.");
        }
    };

    // --- LANE DRAWING LOGIC ---
    const handleLaneClick = (coords) => {
        const nodeId = `N-${Date.now().toString().slice(-5)}`;
        const newNode = { id: nodeId, x: coords.x + '%', y: coords.y + '%' };

        let newLanes = [...mapData.lanes];

        // Connect to previous node if selected
        if (selectedNodeId) {
            const laneId = `L-${Date.now().toString().slice(-5)}`;
            newLanes.push({ id: laneId, start: selectedNodeId, end: nodeId });
        }

        const newNodes = [...mapData.nodes, newNode];

        setMapData({ ...mapData, nodes: newNodes, lanes: newLanes });
        saveMapData({ ...mapData, nodes: newNodes, lanes: newLanes });

        setSelectedNodeId(nodeId); // Auto-select new node for chaining
    };

    const handleNodeClick = (id, e) => {
        e.stopPropagation();
        if (activeTool === 'lane') {
            if (selectedNodeId === id) {
                setSelectedNodeId(null); // Deselect (Stop Path)
            } else {
                // Connect if we have a previous selection? Or just start new path?
                // Let's allow connecting:
                if (selectedNodeId) {
                    // Connect previous to this
                    const laneId = `L-${Date.now().toString().slice(-5)}`;
                    const newLanes = [...mapData.lanes, { id: laneId, start: selectedNodeId, end: id }];
                    setMapData({ ...mapData, lanes: newLanes });
                    saveMapData({ ...mapData, lanes: newLanes });
                }
                setSelectedNodeId(id); // Select this one
            }
        } else if (activeTool === 'delete') {
            deleteItem('node', id, e);
        } else if (activeTool === 'entry') {
            // Set this node as the ENTRY point
            // Remove is_entry from all other nodes (Single Entry Policy for now)
            const newNodes = mapData.nodes.map(n => ({
                ...n,
                is_entry: n.id === id ? true : false
            }));
            setMapData({ ...mapData, nodes: newNodes });
            saveMapData({ ...mapData, nodes: newNodes });
        }
    };


    // --- MOUSE HANDLERS ---
    const handleMouseDown = (e) => {
        if (isConfiguringMap || e.target.closest('.slot-del-btn') || e.target.closest('.toolbar-btn')) return;
        e.preventDefault();

        const coords = getPercentageCoords(e);

        if (activeTool === 'wand') {
            performMagicWand(coords);
            return;
        }

        if (activeTool === 'lane') {
            handleLaneClick(coords);
            return;
        }

        if (activeTool === 'rect') {
            startPosRef.current = coords;
            setDrawing(true);
            setCurrentRect({ ...coords, width: 0, height: 0 });
        }
    };

    const updateRect = useCallback((e) => {
        const coords = getPercentageCoords(e);
        const start = startPosRef.current;

        const width = Math.abs(coords.x - start.x);
        const height = Math.abs(coords.y - start.y);
        const x = Math.min(coords.x, start.x);
        const y = Math.min(coords.y, start.y);

        setCurrentRect({ x, y, width, height });
    }, []);

    useEffect(() => {
        const handleGlobalMove = (e) => {
            if (!drawingRef.current) return;
            updateRect(e);
        };

        const handleGlobalUp = (e) => {
            if (!drawingRef.current) return;
            setDrawing(false);

            const coords = getPercentageCoords(e);
            const start = startPosRef.current;
            const width = Math.abs(coords.x - start.x);
            const height = Math.abs(coords.y - start.y);
            const x = Math.min(coords.x, start.x);
            const y = Math.min(coords.y, start.y);

            if (width > 1 && height > 1) {
                const id = prompt("Enter Slot ID:", `S-${Date.now().toString().slice(-4)}`);
                if (id) {
                    const newSlot = {
                        id,
                        x: x + '%', y: y + '%', width: width + '%', height: height + '%',
                        occupied: false, sensor_status: 'EMPTY', site_id: selectedSite?.id
                    };
                    saveMapData({ ...mapData, slots: [...mapData.slots, newSlot] });
                }
            }
            setCurrentRect(null);
        };

        if (drawing) {
            window.addEventListener('mousemove', handleGlobalMove);
            window.addEventListener('mouseup', handleGlobalUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleGlobalMove);
            window.removeEventListener('mouseup', handleGlobalUp);
        };
    }, [drawing, selectedSite, updateRect, mapData]);

    const deleteItem = (type, id, e) => {
        e.stopPropagation();
        if (!window.confirm("Delete?")) return;

        if (type === 'slot') {
            const newSlots = mapData.slots.filter(s => s.id !== id);
            saveMapData({ ...mapData, slots: newSlots });
        }
        // Could implement node/lane deletion similarly
        if (type === 'node') {
            // Delete node AND connected lanes
            const newNodes = mapData.nodes.filter(n => n.id !== id);
            const newLanes = mapData.lanes.filter(l => l.start !== id && l.end !== id);
            setMapData({ ...mapData, nodes: newNodes, lanes: newLanes });
            saveMapData({ ...mapData, nodes: newNodes, lanes: newLanes });
        }
    };

    // Explicit Save Action
    const handleManualSave = () => {
        saveMapData(mapData);
        alert("Layout Saved Successfully!");
    };

    if (!selectedSite) return <div className="p-8 text-center text-slate-500">Select a site to edit map.</div>;

    if (isLoading) return <div className="p-8 text-center text-slate-500 animate-pulse">Loading map configuration...</div>;

    return (
        <div className="h-full flex flex-col p-6 animate-fade-in relative bg-slate-900/50">
            <div className="flex justify-between items-center mb-4 shrink-0">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <span className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                        </span>
                        Digital Twin Editor
                    </h2>
                    <p className="text-slate-400 text-sm">Configure physical layout @ {selectedSite.name}</p>
                </div>

                {/* TOOLBAR */}
                <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700/50">
                    <button
                        onClick={() => setActiveTool('rect')}
                        className={`toolbar-btn px-4 py-2 rounded text-xs font-bold flex items-center gap-2 transition-all ${activeTool === 'rect' ? 'bg-amber-500 text-black shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                        title="Draw Parking Slot"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h16v16H4V4z" /></svg>
                        Slot
                    </button>
                    <button
                        onClick={() => setActiveTool('wand')}
                        className={`toolbar-btn px-4 py-2 rounded text-xs font-bold flex items-center gap-2 transition-all ${activeTool === 'wand' ? 'bg-purple-500 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                        title="Auto-Detect Slot"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        Magic Wand
                    </button>
                    <button
                        onClick={() => setActiveTool('lane')}
                        className={`toolbar-btn px-4 py-2 rounded text-xs font-bold flex items-center gap-2 transition-all ${activeTool === 'lane' ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                        title="Draw Driveable Path"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                        Draw Lanes
                    </button>
                    <button
                        onClick={() => setActiveTool('entry')}
                        className={`toolbar-btn px-4 py-2 rounded text-xs font-bold flex items-center gap-2 transition-all ${activeTool === 'entry' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                        title="Set Entry Point"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        Set Entry
                    </button>
                    <button
                        onClick={() => setActiveTool('delete')}
                        className={`toolbar-btn px-4 py-2 rounded text-xs font-bold flex items-center gap-2 transition-all ${activeTool === 'delete' ? 'bg-red-500 text-white shadow-lg' : 'text-slate-400 hover:text-red-400 hover:bg-slate-700'}`}
                        title="Delete Item"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Delete
                    </button>

                    <div className="w-px bg-slate-700 h-6 mx-2"></div>

                    <button
                        onClick={() => setSelectedNodeId(null)}
                        className={`toolbar-btn px-3 py-2 rounded text-xs font-bold transition-all text-slate-400 hover:text-white hover:bg-slate-700 ${selectedNodeId ? 'animate-pulse text-amber-400' : 'opacity-50 cursor-not-allowed'}`}
                        disabled={!selectedNodeId}
                        title="Deselect Node / Stop Path"
                    >
                        Stop Path
                    </button>
                    <button
                        onClick={handleManualSave}
                        className="toolbar-btn px-3 py-2 rounded text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow ml-2 transition-all active:scale-95"
                    >
                        Save Layout
                    </button>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => setIsConfiguringMap(!isConfiguringMap)}
                        className="text-xs px-3 py-2 rounded border border-slate-600 text-slate-300 hover:text-white transition-colors"
                    >
                        {isConfiguringMap ? "Done" : "Change Image"}
                    </button>
                </div>
            </div>

            {/* MAP CONFIGURATION PANEL */}
            {isConfiguringMap && (
                <div className="bg-slate-800/90 border border-amber-500/30 p-4 rounded-xl mb-4 animate-slide-in-top shrink-0 z-20 absolute top-20 right-6 shadow-2xl w-80">
                    <h3 className="text-sm font-bold text-amber-500 mb-2 uppercase tracking-wide">Update Map Image</h3>
                    <div className="flex flex-col gap-3">
                        <div>
                            <label className="text-xs text-slate-400 block mb-1">Image URL (or Base64)</label>
                            <input
                                type="text"
                                value={imageUrlInput}
                                onChange={(e) => setImageUrlInput(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-slate-200 focus:border-amber-500 outline-none font-mono"
                                placeholder="https://example.com/map.png"
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-xs text-slate-500 font-bold uppercase">OR</span>
                            <label className="cursor-pointer bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded text-xs text-white transition-colors w-full text-center">
                                Upload File
                                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                            </label>
                        </div>
                        <div className="flex gap-2 mt-2">
                            <button onClick={() => handleSaveImageParams(null)} className="bg-amber-500 hover:bg-amber-600 text-white rounded px-4 py-2 text-sm font-bold flex-1">Save</button>
                            <button onClick={handleResetImage} className="bg-slate-700 hover:bg-slate-600 text-slate-300 rounded px-4 py-2 text-sm font-bold">Reset</button>
                        </div>
                    </div>
                </div>
            )}

            {/* RESPONSIVE MAP CONTAINER */}
            <div className="flex-1 flex items-center justify-center relative min-h-0 bg-slate-950 rounded-xl border border-slate-800/50 overflow-hidden shadow-inner p-4">

                {/* DRAWING SURFACE */}
                <div
                    ref={containerRef}
                    className="relative inline-block h-full max-w-full cursor-crosshair group shadow-2xl"
                    onMouseDown={handleMouseDown}
                >
                    <img
                        ref={imgRef}
                        src={selectedSite.image_url || "/parking-layout.png"}
                        alt="Parking Layout"
                        className="h-full w-auto max-w-full object-contain pointer-events-none select-none rounded opacity-80"
                        draggable={false}
                    />

                    {/* RENDER LANES AND NODES */}
                    <svg className="absolute inset-0 w-full h-full z-10" style={{ pointerEvents: 'none' }}>
                        {mapData.lanes?.map(lane => {
                            const start = mapData.nodes?.find(n => n.id === lane.start);
                            const end = mapData.nodes?.find(n => n.id === lane.end);
                            if (!start || !end) return null;
                            return (
                                <line
                                    key={lane.id}
                                    x1={start.x} y1={start.y}
                                    x2={end.x} y2={end.y}
                                    stroke={activeTool === 'delete' ? '#ef4444' : '#3b82f6'}
                                    strokeWidth="8"
                                    opacity="0.8"
                                    strokeDasharray="5,5"
                                    style={{ pointerEvents: activeTool === 'delete' ? 'stroke' : 'none', cursor: activeTool === 'delete' ? 'pointer' : 'default' }}
                                    onClick={(e) => {
                                        if (activeTool === 'delete') {
                                            e.stopPropagation();
                                            if (window.confirm("Delete this lane?")) {
                                                const newLanes = mapData.lanes.filter(l => l.id !== lane.id);
                                                setMapData({ ...mapData, lanes: newLanes });
                                                saveMapData({ ...mapData, lanes: newLanes });
                                            }
                                        }
                                    }}
                                />
                            );
                        })}
                        {mapData.nodes?.map(node => (
                            <g
                                key={node.id}
                                onClick={(e) => handleNodeClick(node.id, e)}
                                className="cursor-pointer transition-all group/node"
                                style={{ pointerEvents: 'all' }}
                            >
                                {/* Glow for Entry Node */}
                                {node.is_entry && (
                                    <circle cx={node.x} cy={node.y} r="15" fill="none" stroke="#10b981" strokeWidth="2" className="animate-ping opacity-75" />
                                )}
                                <circle
                                    cx={node.x} cy={node.y}
                                    r={node.is_entry ? "8" : "4"}
                                    fill={node.is_entry ? "#10b981" : (node.id === selectedNodeId ? "#fbbf24" : (activeTool === 'delete' ? '#ef4444' : "#3b82f6"))} // Green for entry
                                    stroke="white" strokeWidth="2"
                                    className="hover:r-6 transition-all"
                                />
                                {node.is_entry && (
                                    <text x={node.x} y={node.y} dy="-12" textAnchor="middle" fill="#10b981" fontSize="10" fontWeight="bold" className="pointer-events-none drop-shadow-md">START</text>
                                )}
                            </g>
                        ))}
                    </svg>

                    {/* SLOTS OVERLAY */}
                    {mapData.slots?.map(slot => (
                        <div
                            key={slot.id}
                            className={`slot-item absolute border-2 transition-all flex items-center justify-center shadow-lg rounded-sm group-hover/map:opacity-100 ${activeTool === 'delete' ? 'bg-red-500/20 border-red-500 cursor-pointer' : 'bg-white/10 border-white/50 hover:bg-white/20 hover:border-white'}`}
                            style={{
                                left: slot.x,
                                top: slot.y,
                                width: slot.width,
                                height: slot.height
                            }}
                            onClick={(e) => {
                                if (activeTool === 'delete') deleteItem('slot', slot.id, e);
                            }}
                        >
                            <span className="text-[10px] sm:text-xs font-bold text-white drop-shadow-md pointer-events-none bg-black/50 px-1 rounded">{slot.id}</span>
                            {activeTool !== 'delete' && (
                                <button
                                    onClick={(e) => deleteItem('slot', slot.id, e)}
                                    className="slot-del-btn absolute -top-2 -right-2 bg-red-500 hover:bg-red-400 text-white w-5 h-5 rounded-full flex items-center justify-center shadow-md opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity z-20 scale-75 hover:scale-110"
                                >
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            )}
                        </div>
                    ))}

                    {/* CURRENTLY DRAWING RECT */}
                    {currentRect && (
                        <div
                            className="absolute border-2 border-amber-400 animate-pulse bg-amber-500/20 pointer-events-none z-30"
                            style={{
                                left: `${currentRect.x}%`,
                                top: `${currentRect.y}%`,
                                width: `${currentRect.width}%`,
                                height: `${currentRect.height}%`
                            }}
                        ></div>
                    )}
                </div>

                <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none z-40">
                    <div className="text-xs text-white font-mono bg-slate-900/90 inline-flex items-center gap-3 px-4 py-2 rounded-full border border-slate-700 shadow-xl">
                        {activeTool === 'rect' && <span>Drag to create Slot</span>}
                        {activeTool === 'wand' && <span>Click inside a parking box to Auto-Detect</span>}
                        {activeTool === 'lane' && <span>Click to place Path Nodes. Click <b>Stop Path</b> to end chain.</span>}
                        {activeTool === 'entry' && <span className="text-emerald-400">Click a Node to mark it as the <b>ENTRY POINT</b></span>}
                        {activeTool === 'delete' && <span className="text-red-400">Click items (Slots or Nodes) to Delete</span>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MapEditor;
