// StatsChamps.js
import React, { useState, useEffect } from 'react';
import './statsChamps.css';

export function StatsData({ currUser }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const url = `https://localhost:5000/api/stats/userStats/${currUser}`;
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        if (response.ok) {
          setStats(data);
        } else {
          console.error('Failed to fetch user stats:', data.message);
        }
      } catch (error) {
        console.error('Fetch attempt failed:', error);
      }
    };

    fetchUserStats();
  }, [currUser]);

  return (
    <div className="stats">
        <h2>User Stats for {currUser}</h2>
        {stats ? (
          <ul>
            <li>Total Games Played: {stats.totalGamesPlayed}</li>
            <li>Total Wins: {stats.totalWins}</li>
            <li>Total Draws: {stats.totalDraws}</li>
            <li>Total Losses: {stats.totalLoss}</li>
          </ul>
        ) : (
          <p>No stats available.</p>
        )}
    </div>
  );
}

export function ChampsData({handleClose}) {
  const [champs, setChamps] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Add loading state

  useEffect(() => {
    const fetchChampsStats = async () => {
      setIsLoading(true);  // Start loading
      try {
        const url = 'https://localhost:5000/api/stats/topPlayers';
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        if (response.ok) {
          setChamps(data);
        } else {
          console.error('Failed to fetch top players:', data.message);
        }
      } catch (error) {
        console.error('Fetch attempt failed:', error);
      } finally {
        setIsLoading(false);  // Stop loading regardless of the outcome
      }
    };

    fetchChampsStats();
  }, []);

  if (isLoading) {
    return <p>Loading...</p>;  // Render a loading indicator
  }
  
  return (
    <div className="stats-popup">
      <div className="stats-popup-content">
      <span className="close-button" onClick={handleClose}>X</span>
        <h1>Leaderboards</h1>
        {champs ? (
          <>
            <h2>Top Players by Wins</h2>
            <ul>
              {champs.topWins.map(player => (
                <li key={player._id}>
                  <span>{player.nickname}</span>
                  <span>{player.totalWins}</span> </li>
              ))}
            </ul>
            <h2>Top Players by Games Played</h2>
            <ul>
              {champs.topGames.map(player => (
                <li key={player._id}>
                  <span>{player.nickname}</span>
                  <span>{player.totalGamesPlayed}</span> </li>
              ))}
            </ul>
          </>
        ) : (
          <p>No champion data available.</p>
        )}
      </div>
    </div>
  );
}
