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

const EntryTextArea = styled.textarea`
  width: 100%;
  min-height: clamp(200px, 40vh, 500px);
  max-height: 70vh;
  height: 100%;
  box-sizing: border-box;
  padding: 1rem;
  border: 1px solid #e1e1e1;
  border-radius: 8px;
  font-size: 1rem;
  line-height: 1.5;
  resize: vertical;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
  }
`;

// Add a base button style
const BaseButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  min-width: 100px;  // Set minimum width for both buttons
  text-align: center;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

// Update SaveButton to extend BaseButton
const SaveButton = styled(BaseButton)`
  background-color: #7eb3ff;
  color: white;

  &:hover {
    background-color: #6a9fee;
  }

  &:disabled {
    background-color: #ccc;
  }
`;

// Update DeleteButton to extend BaseButton
const DeleteButton = styled(BaseButton)`
  background-color: #ff6b6b;
  color: white;

  &:hover {
    background-color: #ff5252;
  }
`;

const EntryDate = styled.h2`
  font-size: 1.25rem;
  font-weight: 500;
  margin: 0 0 1.5rem 0;
  color: #333;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

// Format the date to match your screenshot
const formatDisplayDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  });
};

interface DiaryEntryProps {
  date: Date;
  entry: { content: string } | null;
  onSave: (date: Date, content: string) => void;
  onDelete?: () => void;
  loading?: boolean;
}

const DiaryEntry: React.FC<DiaryEntryProps> = ({ date, entry, onSave, onDelete, loading }) => {
  const [content, setContent] = useState(entry?.content || '');

  useEffect(() => {
    setContent(entry?.content || '');
  }, [entry]);

  return (
    <>
      <EntryDate>{formatDisplayDate(date)}</EntryDate>
      <EntryTextArea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind today?"
      />
      <ButtonGroup>
        <SaveButton
          onClick={() => onSave(date, content)}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Edit Entry'}
        </SaveButton>
        {entry && onDelete && (
          <DeleteButton onClick={onDelete}>
            Delete Entry
          </DeleteButton>
        )}
      </ButtonGroup>
    </>
  );
};

export default DiaryEntry; 