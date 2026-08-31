import React from 'react';
import { act, create } from 'react-test-renderer';
import { FolderGroup, useFolderGroups } from '../../src/hooks/useFolderGroups';
import { useMusicStore } from '../../src/store/useMusicStore';
import { Track } from '../../src/types/music';

const mockTracks: Track[] = [
  {
    id: '1',
    title: 'Song 1',
    artist: 'Artist 1',
    url: 'file:///storage/Music/Rock/song1.mp3',
    folderPath: '/storage/Music/Rock',
    isLocal: true,
  },
  {
    id: '2',
    title: 'Song 2',
    artist: 'Artist 2',
    url: 'file:///storage/Music/Rock/song2.mp3',
    folderPath: '/storage/Music/Rock',
    isLocal: true,
  },
  {
    id: '3',
    title: 'Song 3',
    artist: 'Artist 3',
    url: 'file:///storage/Music/Jazz/song3.mp3',
    folderPath: '/storage/Music/Jazz',
    isLocal: true,
  },
  {
    id: '4',
    title: 'Song 4',
    artist: 'Artist 4',
    url: 'file:///storage/Music/song4.mp3',
    isLocal: true,
  },
];

function TestHarness({ onRender }: { onRender: (groups: FolderGroup[]) => void }) {
  const groups = useFolderGroups();
  onRender(groups);
  return null;
}

describe('useFolderGroups', () => {
  beforeEach(() => {
    useMusicStore.setState({ tracks: [] });
  });

  it('groups tracks by their folderPath and generates correct folder labels', () => {
    useMusicStore.setState({ tracks: mockTracks });

    let renderedGroups: FolderGroup[] = [];
    act(() => {
      create(<TestHarness onRender={(groups) => (renderedGroups = groups)} />);
    });

    expect(renderedGroups).toHaveLength(3);

    const rockGroup = renderedGroups.find((g) => g.folder === '/storage/Music/Rock');
    expect(rockGroup).toBeDefined();
    expect(rockGroup?.label).toBe('Rock');
    expect(rockGroup?.count).toBe(2);
    expect(rockGroup?.tracks).toHaveLength(2);

    const jazzGroup = renderedGroups.find((g) => g.folder === '/storage/Music/Jazz');
    expect(jazzGroup).toBeDefined();
    expect(jazzGroup?.label).toBe('Jazz');
    expect(jazzGroup?.count).toBe(1);

    const otherGroup = renderedGroups.find((g) => g.folder === 'Autres morceaux');
    expect(otherGroup).toBeDefined();
    expect(otherGroup?.count).toBe(1);
  });
});
