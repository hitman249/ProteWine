export default class Time {
  public static secondPrint(sec: number): string {
    let hours: number = Math.floor(sec / 3600);
    let minutes: number = Math.floor((sec - (hours * 3600)) / 60);
    let seconds: number = Math.floor((sec - (hours * 3600)) - (minutes * 60));

    if (hours) {
      return `${hours} hours`;
    }

    if (minutes) {
      return `${minutes} minutes`;
    }

    if (seconds) {
      return `${seconds} seconds`;
    }

    return 'n/a';
  }
}
