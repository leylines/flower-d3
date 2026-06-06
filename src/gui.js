import GUI from 'lil-gui';

export function createGUI(config, handlers) {
  const gui = new GUI({ title: 'Controls', width: 280 });

  gui.add(config, 'numPoints', 16000, 512000, 1000)
    .name('Points')
    .onChange(handlers.onNumPoints);

  gui.add(config, 'duration', 1000, 30000, 500)
    .name('Duration (ms)')
    .onChange(handlers.onDuration);

  gui.add(config, 'bgBlack')
    .name('Dark background')
    .onChange(handlers.onBg);

  const seq = gui.addFolder('Sequence');
  seq.add(config, 'seqTree').name('Tree').onChange(handlers.onSequence);
  seq.add(config, 'seqFlower').name('Flower').onChange(handlers.onSequence);
  seq.add(config, 'seqMeta').name('Meta').onChange(handlers.onSequence);
  seq.add(config, 'seqPhyllotaxis').name('Phyllotaxis transition').onChange(handlers.onSequence);
}
