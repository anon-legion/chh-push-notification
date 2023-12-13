function notifStatusToString(notifStatus: number) {
  switch (notifStatus) {
    case 1:
      return 'pending';
    case 2:
      return 'sent';
    case 3:
      return 'read';
    default:
      return 'unknown';
  }
}

export default notifStatusToString;
