import { Share } from 'react-native';

export class StringSharer {
  async share(value: string, title: string): Promise<void> {
    await Share.share({
      message: value,
      title,
    });
  }
}
