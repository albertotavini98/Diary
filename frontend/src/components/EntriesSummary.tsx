import React, { useState, useEffect } from 'react';
import { diaryApi } from '../services/api';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const SummaryContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
  background: #d4e5ff;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  background: #7eb3ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;

  &:hover {
    background: #6a9fee;
  }

  &.delete {
    background: #ff6b6b;
    
    &:hover {
      background: #ff5252;
    }
  }
`;

const EntryCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  h3 {
    margin: 0;
    color: #333;
  }

  p {
    margin: 0;
    white-space: pre-wrap;
  }
`;

const DeleteButton = styled.button`
  padding: 0.3rem 0.8rem;
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;

  &:hover {
    background: #ff5252;
  }

  &:disabled {
    background: #ffb5b5;
    cursor: not-allowed;
  }
`;

interface Entry {
  id: number;
  date: string;
  content: string;
}

const EntriesSummary: React.FC = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await diaryApi.getEntries();
      console.log('Received entries:', response.data);
      
      const sortedEntries = response.data.sort((a: Entry, b: Entry) => {
        const [yearA, monthA, dayA] = a.date.split('-').map(Number);
        const [yearB, monthB, dayB] = b.date.split('-').map(Number);
        return new Date(yearB, monthB - 1, dayB).getTime() - 
               new Date(yearA, monthA - 1, dayA).getTime();
      });
      setEntries(sortedEntries);
    } catch (error) {
      console.error('Failed to fetch entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (date: string) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        setDeleting(date);
        await diaryApi.deleteEntry(date);
        setEntries(entries.filter(entry => entry.date !== date));
      } catch (error) {
        console.error('Failed to delete entry:', error);
        alert('Failed to delete entry. Please try again.');
      } finally {
        setDeleting(null);
      }
    }
  };

  const formatDate = (dateString: string) => {
    console.log('EntriesSummary - Incoming date string:', dateString);
    
    // Split the date string and create a new date
    const [year, month, day] = dateString.split('-').map(Number);
    console.log('EntriesSummary - Parsed components:', { year, month, day });
    
    // Create date object (month - 1 because JavaScript months are 0-based)
    const date = new Date(year, month - 1, day, 12, 0, 0);
    console.log('EntriesSummary - Created date object:', date);
    
    const formatted = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    console.log('EntriesSummary - Final formatted date:', formatted);
    return formatted;
  };

  return (
    <SummaryContainer>
      <Header>
        <h2>All Diary Entries</h2>
        <Button onClick={() => navigate('/')}>Back to Calendar</Button>
      </Header>
      
      {loading ? (
        <p>Loading entries...</p>
      ) : entries.length === 0 ? (
        <p>No entries found.</p>
      ) : (
        entries.map(entry => (
          <EntryCard key={entry.id}>
            <div className="header">
              <h3>{formatDate(entry.date)}</h3>
              <DeleteButton
                onClick={() => handleDelete(entry.date)}
                disabled={deleting === entry.date}
              >
                {deleting === entry.date ? 'Deleting...' : 'Delete'}
              </DeleteButton>
            </div>
            <p>{entry.content}</p>
          </EntryCard>
        ))
      )}
    </SummaryContainer>
  );
};

export default EntriesSummary; 