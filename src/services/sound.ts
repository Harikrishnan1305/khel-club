export type SoundName =
  | 'dice'
  | 'ladder'
  | 'snake'
  | 'win'
  | 'capture'
  | 'home';

/**
 * Sound service stub for game sound effects.
 * Audio playback will be wired in a future milestone when audio assets are added.
 */
export function playSound(_name: SoundName): void {
  // No-op until audio files are bundled
}
