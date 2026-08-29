import { useMemo } from 'react';
import { useMusicStore } from '../store/useMusicStore';
import { Track } from '../types/music';

export interface FolderGroup {
  folder: string;
  label: string;
  count: number;
  tracks: Track[];
}

/** Groups the current library's tracks by their parent folder — shared by the Library's Folders tab and Settings' folder-exclusion list. */
export function useFolderGroups(): FolderGroup[] {
  const tracks = useMusicStore((s) => s.tracks);

  return useMemo(() => {
    const foldersMap = new Map<string, Track[]>();
    tracks.forEach((t) => {
      const folder = t.folderPath || 'Autres morceaux';
      const list = foldersMap.get(folder) || [];
      list.push(t);
      foldersMap.set(folder, list);
    });
    return Array.from(foldersMap.entries()).map(([folder, trks]) => ({
      folder,
      label: folder.split('/').filter(Boolean).pop() || folder,
      count: trks.length,
      tracks: trks,
    }));
  }, [tracks]);
}
