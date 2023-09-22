import { MoodEnum } from "../constants/moods";

export type Entry = {
  id: string;
  content: string;
  imagesUrl?: string[];
  tag?: string;
  mood?: MoodEnum;
  isCrypto?: boolean;
  isPinned?: boolean;
  date: Date;
};
