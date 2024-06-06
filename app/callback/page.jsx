"use client";
import React, { useEffect, useState } from 'react';
import { Wheel } from 'react-custom-roulette';
import Image from "next/image";
import logo from "/public/logo.webp";

const data = [
    { option: '0', style: { backgroundColor: 'green', textColor: 'green'} },
    { option: '1', style: { backgroundColor: 'white', textColor: 'white'} },
    { option: '0', style: { backgroundColor: 'green', textColor: 'green'} },
    { option: '1', style: { backgroundColor: 'white', textColor: 'white'} },
    { option: '0', style: { backgroundColor: 'green', textColor: 'green'} },
    { option: '1', style: { backgroundColor: 'white', textColor: 'white'} },
    { option: '0', style: { backgroundColor: 'green', textColor: 'green'} },
    { option: '1', style: { backgroundColor: 'white', textColor: 'white'} },
    { option: '0', style: { backgroundColor: 'green', textColor: 'green'} },
    { option: '1', style: { backgroundColor: 'white', textColor: 'white'} },
    { option: '0', style: { backgroundColor: 'green', textColor: 'green'} },
    { option: '1', style: { backgroundColor: 'white', textColor: 'white'} },
];

const CallbackComponent = () => {
    const [authToken, setAuthToken] = useState(null);
    const [servers, setServers] = useState([]);
    const [libraries, setLibraries] = useState([]);
    const [selectedServer, setSelectedServer] = useState('');
    const [selectedLibraryKey, setSelectedLibraryKey] = useState('');
    const [selectedMovies, setSelectedMovies] = useState([]);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [showSpinButton, setShowSpinButton] = useState(false);
    const [mustSpin, setMustSpin] = useState(false);
    const [prizeNumber, setPrizeNumber] = useState(0);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem('plex_auth_token');
            setAuthToken(token);

            if (token) {
                fetchServers(token);
            } else {
                fetchAuthToken();
            }
        }
    }, []);

    const fetchAuthToken = async () => {
        const id = localStorage.getItem('plex_pin_id');
        const code = localStorage.getItem('plex_pin_code');
        const clientIdentifier = '38c35482-5611-4b25-9b17-ab5e1d3fad01';

        try {
            const response = await fetch(`https://plex.tv/api/v2/pins/${id}?code=${code}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json',
                    'X-Plex-Client-Identifier': clientIdentifier
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const token = data.authToken;
            console.log('Token:', token);
            if (typeof window !== "undefined") {
                localStorage.setItem('plex_auth_token', token);
            }
            setAuthToken(token);
            fetchServers(token);
        } catch (error) {
            console.error('Error fetching auth token:', error);
        }
    };

    const fetchServers = async (token) => {
        try {
            const response = await fetch(`https://clients.plex.tv/api/v2/resources?X-Plex-Client-Identifier=null&X-Plex-Token=${token}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const serverList = data.map(server => {
                const { name, publicAddress, connections, accessToken } = server;
                const connection = connections.find(conn => conn.address === publicAddress);
                const port = connection ? connection.port : null;
                const address = publicAddress.replace(/\./g, '-');
                return { name, address, port, accessToken };
            });
            if (typeof window !== "undefined") {
                localStorage.setItem('plex_server_list', JSON.stringify(serverList));
            }
            setServers(serverList);
        } catch (error) {
            console.error('Error fetching servers:', error);
        }
    };

    const fetchLibraries = async (server) => {
        const { address, port, accessToken } = server;
        if (typeof window !== "undefined") {
            localStorage.setItem('plex_server_address', address);
            localStorage.setItem('plex_server_port', port);
            localStorage.setItem('plex_access_Token', accessToken);
        }

        try {
            const response = await fetch(`https://${address}-${port}.plex-roulette.com/library/sections`, {
                method: 'GET',
                headers: {
                    'X-Plex-Token': accessToken,
                    'Accept': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setLibraries(data.MediaContainer.Directory);
        } catch (error) {
            console.error('Error fetching libraries:', error);
        }
    };

    const fetchMovies = async (libraryKey) => {
        const serverAddress = localStorage.getItem('plex_server_address');
        const serverPort = localStorage.getItem('plex_server_port');
        const accessToken = localStorage.getItem('plex_access_Token');

        try {
            const response = await fetch(`https://${serverAddress}-${serverPort}.plex-roulette.com/library/sections/${libraryKey}/unwatched`, {
                method: 'GET',
                headers: {
                    'X-Plex-Token': accessToken,
                    'Accept': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setSelectedMovies(data.MediaContainer.Metadata);
            setShowSpinButton(true);
        } catch (error) {
            console.error('Error fetching movies:', error);
        }
    };

    const displayRandomMovie = async (movies) => {
        const randomIndex = Math.floor(Math.random() * movies.length);
        const randomMovie = movies[randomIndex];
        const { title, thumb } = randomMovie;
        const serverAddress = localStorage.getItem('plex_server_address');
        const serverPort = localStorage.getItem('plex_server_port');
        const authToken = localStorage.getItem('plex_access_Token');
        const imageUrl = `https://${serverAddress}-${serverPort}.plex-roulette.com${thumb}`;

        try {
            const response = await fetch(imageUrl, {
                headers: { 'X-Plex-Token': authToken }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const blob = await response.blob();
            const imageObjectURL = URL.createObjectURL(blob);
            setSelectedMovie({ title, imageObjectURL });
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleServerChange = (event) => {
        const selectedServer = servers.find(server => server.name === event.target.value);
        setSelectedServer(selectedServer.name);
        fetchLibraries(selectedServer);
    };

    const handleLibraryChange = (event) => {
        const libraryKey = event.target.value;
        setSelectedLibraryKey(libraryKey);
        fetchMovies(libraryKey);
    };

    const handleSpinClick = () => {
        if (!mustSpin) {
            const newPrizeNumber = Math.floor(Math.random() * data.length);
            setPrizeNumber(newPrizeNumber);
            setMustSpin(true);
        }
    };

    const handleStopSpinning = () => {
        setMustSpin(false);
        displayRandomMovie(selectedMovies);
    };

    const handleLogout = () => {
        if (typeof window !== "undefined") {
            localStorage.clear();
            window.location.href = '/';
        }
    };

    return (
<main className="flex flex-col min-h-screen p-24">
    {/* Logo en haut à gauche */}
    <div className="absolute top-0 left-10 p-4">
        <Image src={logo} alt="Logo" width={150} height={150} />
    </div>

    {/* Title en haut au centre */}
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text p-4">
        Plex Roulette
    </div>

    {/* Dropdown menus en haut */}
    <div className="flex justify-center w-full mt-20 space-x-4 z-10">
        <div id="servers" className="flex flex-col items-center">
            <label className="mb-2">Firt, chose your server</label>
            {servers.length > 0 ? (
                <select value={selectedServer} onChange={handleServerChange} className="p-2 border rounded">
                    <option value="">Select a server</option>
                    {servers.map(server => (
                        <option key={server.name} value={server.name}>
                            {server.name}
                        </option>
                    ))}
                </select>
            ) : (
                <div>Loading servers...</div>
            )}
        </div>
        {libraries.length > 0 && (
            <div id="libraries" className="flex flex-col items-center">
                <label className="mb-2">Now, chose your library</label>
                <select value={selectedLibraryKey} onChange={handleLibraryChange} className="p-2 border rounded">
                    <option value="">Select a library</option>
                    {libraries.map(library => (
                        <option key={library.key} value={library.key}>
                            {library.title}
                        </option>
                    ))}
                </select>
            </div>
        )}
    </div>

    <div className="flex flex-1 mt-24">
        {/* Roulette à gauche */}
        <div className="flex flex-col items-center justify-center w-1/4">
            {showSpinButton && (
                <div id="spin">
                    <button onClick={handleSpinClick}>
                        <Wheel
                            mustStartSpinning={mustSpin}
                            spinDuration={0.1}
                            prizeNumber={prizeNumber}
                            data={data}
                            onStopSpinning={handleStopSpinning}
                        />
                    </button>
                    <button className="border border-grey-500 p-3 rounded hover:bg-slate-800 cursor-pointer mt-4" onClick={handleSpinClick}>Spin</button>
                </div>
            )}
        </div>
        
        {/* Selected movie à droite */}
        <div className="flex-1 relative">
            {selectedMovie && (
                <div className="absolute top-1/2 right-20 transform -translate-y-1/2">
                    <h2 className="text-2xl">{selectedMovie.title}</h2>
                    <img src={selectedMovie.imageObjectURL} alt={selectedMovie.title} width={300} />
                    <p className="text-2xl">{selectedMovie.title}</p>
                </div>
            )}
        </div>
    </div>

    {/* Logout en haut à droite */}
    <div className="absolute top-4 right-10 p-4">
        <button onClick={handleLogout} className="border border-red-500 p-3 rounded hover:bg-red-800 cursor-pointer">
            Logout
        </button>
    </div>

    <div className="relative place-items-center before:absolute before:h-[300px] before:w-full sm:before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full sm:after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1]">
    </div>
</main>

    
    );
};

export default CallbackComponent;
