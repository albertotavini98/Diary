import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const EntryContainer = styled.div`
  flex: 1;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  h3 {
    margin-bottom: 1rem;
    color: #333;
  }

  textarea {
    width: 100%;
    min-height: 300px;
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    resize: vertical;
    font-family: inherit;
    margin-bottom: 1rem;
  }

  button {
    padding: 0.5rem 1rem;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: #0056b3;
    }

    &:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  }
`;

interface DiaryEntryProps {
  date: Date;
  entry: { content: string } | null;
  onSave: (date: Date, content: string) => void;
  loading?: boolean;
}

const DiaryEntry: React.FC<DiaryEntryProps> = ({ date, entry, onSave, loading }) => {
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (entry) {
      setContent(entry.content);
    } else {
      setContent('');
    }
    setIsEditing(false);
  }, [entry]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    onSave(date, content);
    setIsEditing(false);
  };

  return (
    <EntryContainer>
      <h3>{date.toDateString()}</h3>
      {!entry && !isEditing ? (
        <div>
          <p>No entry for this date.</p>
          <button onClick={handleEdit} disabled={loading}>
            Create Entry
          </button>
        </div>
      ) : (
        <>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your diary entry..."
            disabled={loading || (!isEditing && entry !== null)}
          />
          {isEditing ? (
            <button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Entry'}
            </button>
          ) : (
            <button onClick={handleEdit} disabled={loading}>
              Edit Entry
            </button>
          )}
        </>
      )}
    </EntryContainer>
  );
};

export default DiaryEntry; 