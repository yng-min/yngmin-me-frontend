import React, { useEffect } from 'react';

const TrackInfo = ({ spotifyRecent, currentIndex }) => {
    useEffect(() => {
        const elements = document.querySelectorAll('.track-name, .artist-names, .album-name');
        elements.forEach(el => {
            if (el.scrollWidth > el.clientWidth) {
                el.classList.add('long-text');
            } else {
                el.classList.remove('long-text');
            }
        });
    }, [spotifyRecent, currentIndex]);

    return (
        <div className="track-info">
            <h4 className="track-name">{spotifyRecent[currentIndex].trackName}</h4>
            <p className="artist-names">{spotifyRecent[currentIndex].artistNames}</p>
            <p className="album-name">{spotifyRecent[currentIndex].albumName}</p>
            <p className="duration">Duration: {Math.floor(spotifyRecent[currentIndex].durationMs / 1000 / 60)} min</p>
            <p>Explicit: {spotifyRecent[currentIndex].explicit ? 'Yes' : 'No'}</p>
            <a href={`https://open.spotify.com/track/${spotifyRecent[currentIndex].spotifyId}`} target="_blank" rel="noopener noreferrer">Listen on Spotify</a>
        </div>
    );
};

export default TrackInfo;
