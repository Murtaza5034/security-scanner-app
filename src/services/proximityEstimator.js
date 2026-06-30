export function estimateDistance(detection, videoWidth, videoHeight) {
  if (!detection || !videoWidth || !videoHeight) return null;

  const [, , boxW, boxH] = detection.bbox;

  const frameDiagonal = Math.sqrt(videoWidth ** 2 + videoHeight ** 2);
  const boxDiagonal = Math.sqrt(boxW ** 2 + boxH ** 2);
  const sizeRatio = boxDiagonal / frameDiagonal;

  const objectAvgHeights = {
    0: { height: 1.7, label: 'person' },
    24: { height: 0.5, label: 'backpack' },
    26: { height: 0.4, label: 'handbag' },
    28: { height: 0.6, label: 'suitcase' },
    76: { height: 0.15, label: 'scissors' },
    81: { height: 0.85, label: 'baseball bat' },
    43: { height: 0.1, label: 'knife' },
    90: { height: 0.1, label: 'knife' },
  };

  const classInfo = objectAvgHeights[detection.class];
  const knownHeight = classInfo ? classInfo.height : 0.3;

  const boxHeightRatio = boxH / videoHeight;
  const estimatedFocalLength = 600;
  const distance = (knownHeight * estimatedFocalLength) / (boxHeightRatio * videoHeight);

  const clamped = Math.max(0.5, Math.min(100, Math.round(distance * 10) / 10));
  return { meters: clamped, label: `${clamped}m` };
}

export function estimateDirection(detection, videoWidth) {
  if (!detection || !videoWidth) return null;

  const centerX = detection.centerX;
  const frameCenter = videoWidth / 2;
  const offset = centerX - frameCenter;
  const normalizedOffset = offset / (videoWidth / 2);

  let direction;
  let angle;

  if (Math.abs(normalizedOffset) < 0.1) {
    direction = 'straight ahead';
    angle = 0;
  } else if (normalizedOffset < 0) {
    const severity = Math.abs(normalizedOffset);
    if (severity > 0.6) {
      direction = 'far left';
      angle = -45;
    } else {
      direction = 'left side';
      angle = -20;
    }
  } else {
    const severity = Math.abs(normalizedOffset);
    if (severity > 0.6) {
      direction = 'far right';
      angle = 45;
    } else {
      direction = 'right side';
      angle = 20;
    }
  }

  return { direction, angle: Math.round(angle), offset: Math.round(normalizedOffset * 100) };
}

export function getProximityLabel(detection, videoWidth, videoHeight) {
  const dist = estimateDistance(detection, videoWidth, videoHeight);
  const dir = estimateDirection(detection, videoWidth);

  if (!dist || !dir) return '';

  return `${dist.label} ${dir.direction}`;
}
