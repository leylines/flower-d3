import GUI from 'lil-gui';
import { sequences } from './sequences';

export function createGUI(config, handlers) {
  const gui = new GUI({ title: 'Controls', width: 280 });

  gui.add(config, 'numPoints', 16000, 128000, 1000)
    .name('Points')
    .onChange(handlers.onNumPoints);

  gui.add(config, 'duration', 1000, 30000, 500)
    .name('Duration (ms)')
    .onChange(handlers.onDuration);

  gui.add(config, 'bgBlack')
    .name('Dark background')
    .onChange(handlers.onBg);

  gui.add(config, 'sequenceName', sequences.map(s => s.name))
    .name('Sequence')
    .onChange(handlers.onSequence);
}
