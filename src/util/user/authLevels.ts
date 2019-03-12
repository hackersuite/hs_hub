/**
 * The authorization levels of the user's on the hubs
 */
export enum AuthLevels {
  // NOTE: the auth levels must be ordered in ascending order
  Attendee,
  Volunteer,
  Organizer
}

export function getAuthLevel(isOrganizer: boolean, isVolunteer: boolean): number {
  if (isOrganizer) return AuthLevels.Organizer;
  else if (isVolunteer) return AuthLevels.Volunteer;
  else return AuthLevels.Attendee;
}