"use client";
import React, { useEffect, useState } from 'react';
import { Wheel } from 'react-custom-roulette';
import Image from "next/image";
import logo from "/public/logo.webp";

const data = [
    { option: '0', style: { backgroundColor: 'green', textColor: 'green'} },
    { option: '1', style: { backgroundColor: 'white', textColor: 'white'} },
    // Ajoutez les autres options ici
];

const CallbackComponent = () => {
    // États pour gérer les informations d'authentification, serveurs, bibliothèques, film sélectionné, etc.
    const [authToken, setAuthToken] = useState(localStorage.getItem('plex_auth_token'));
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
        if (authToken) {
            fetchServers(authToken);
        } else {
            fetchAuthToken();
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
            localStorage.setItem('plex_auth_token', token);
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
            localStorage.setItem('plex_server_list', JSON.stringify(serverList));
            setServers(serverList);
        } catch (error) {
            console.error('Error fetching servers:', error);
        }
    };

    const fetchLibraries = async (server) => {
        const { address, port, accessToken } = server;
        localStorage.setItem('plex_server_address', address);
        localStorage.setItem('plex_server_port', port);
        localStorage.setItem('plex_access_Token', accessToken);

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
        localStorage.clear();
        window.location.href = 'http://localhost:3000';
    };

    return (
        <div>
            <div id="servers">
                {servers.length > 0 ? (
                    <div>
                        <label>Select your server:</label>
                        <select value={selectedServer} onChange={handleServerChange}>
                            <option value="">Select a server</option>
                            {servers.map(server => (
                                <option key={server.name} value={server.name}>
                                    {server.name}
                                </option>
                            ))}
                        </select>
                    </div>
                ) : (
                    <div>Loading servers...</div>
                )}
            </div>
            {libraries.length > 0 && (
                <div id="libraries">
                    <label>Select the library:</label>
                    <select value={selectedLibraryKey} onChange={handleLibraryChange}>
                        <option value="">Select a library</option>
                        {libraries.map(library => (
                            <option key={library.key} value={library.key}>
                                {library.title}
                            </option>
                        ))}
                    </select>
                </div>
            )}
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
                    <button className="border border-grey-500 p-3 rounded hover:bg-slate-800 cursor-pointer" onClick={handleSpinClick}>Spin</button>
                </div>
            )}
            <div id="roulette">
                {selectedMovie && (
                    <div className="absolute top-50 right-20 p-4">
                        <h2>{selectedMovie.title}</h2>
                        <img src={selectedMovie.imageObjectURL} alt={selectedMovie.title} width={300} />
                    </div>
                )}
            </div>
            <div id="logout">
                <button onClick={handleLogout} className="border border-red-500 p-3 rounded hover:bg-red-800 cursor-pointer">
                    Logout
                </button>
            </div>
        </div>
    );
};

export default CallbackComponent;
