/**
 * The authorization levels of the user's on the hubs
 */
export enum AuthLevels {
  // NOTE: the auth levels must be ordered in ascending order
  Applicant, // The default authorization level. A user who made an application to the hackathon
  Attendee, // A user that has been accepted to the hackathon
  Volunteer, // A user who has access to some management functionalities (e.g.: hardware loans)
  Organizer // A user who has access to everything
}