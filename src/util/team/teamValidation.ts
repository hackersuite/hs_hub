import { getConnection } from "typeorm";
import { User, Team } from "../../db/entity/hub";

export const createOrAddTeam = async (userID: number, teamCode: string): Promise<void> => {
  // Try to create a new team, if it exists, then add the user instead
  if (!(await createTeam(teamCode))) {
    await joinTeam(userID, teamCode);
  }
};

export const createTeam = async (teamCode: string): Promise<boolean> => {
  if (teamCode === undefined) return false;

  if (!(await checkTeamExists(teamCode))) {
    await getConnection("hub")
      .getRepository(Team)
      .save({ teamCode: teamCode });

    return true;
  }
  return false;
};

export const leaveTeam = async (userID: number): Promise<boolean> => {
  try {
    await getConnection("hub")
      .createQueryBuilder()
      .update(User)
      .set({ team: undefined })
      .where("id = :id", { id: userID })
      .execute();
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

export const joinTeam = async (userID: number, teamCode: string): Promise<boolean> => {
  if (teamCode === undefined) return false;

  if (await checkTeamExists(teamCode)) {
    await getConnection("hub")
      .getRepository(User)
      .save({ id: userID, team: teamCode });

    return true;
  }
  console.log("failed");
  return false;
};

export const updateUserWithTeamCode = async (userID: number, userTeamCode: string): Promise<boolean> => {
  try {
    if (!(await checkTeamExists(userTeamCode)))
      return false;
    await getConnection("hub")
      .createQueryBuilder()
      .update(User)
      .set({ team: userTeamCode })
      .where("id = :id", { id: userID })
      .execute();

    return true;
  } catch (err) {
    throw new Error(`Lost connection to database (hub)! ${err}`);
  }
};

export const updateTeamRepository = async (teamCode: string, newTeamRepo: string): Promise<boolean> => {
  if (!(await checkTeamExists(teamCode)))
    return false;

  try {
    await getConnection("hub")
      .getRepository(Team)
      .save({teamCode: teamCode, repo: newTeamRepo});
    return true;
  } catch (err) {
    throw new Error(`Lost connection to database (hub)! ${err}`);
  }
};

export const checkTeamExists = async (userTeamCode: string): Promise<boolean> => {
  try {
    const teamCodeValid: boolean = await getConnection("hub")
      .getRepository(Team)
      .createQueryBuilder()
      .where("teamCode = :teamCode", { teamCode: userTeamCode })
      .getCount() > 0;

    return teamCodeValid;
  } catch (err) {
    throw new Error(`Lost connection to database (hub)! ${err}`);
  }
};

export const getAllUsersInTeams = async (): Promise<User[]> => {
  try {
    return await getConnection("hub")
    .getRepository(User)
    .createQueryBuilder("user")
    .select(["user.name", "user.team"])
    .where("user.team != :empty", { empty: "" })
    .getMany();
  } catch (err) {
    throw new Error(`Lost connection to database (hub)! ${err}`);
  }
};

export const getUsersTeamMembers = async (teamCode: string): Promise<User[]> => {
  try {
    return await getConnection("hub")
    .getRepository(User)
    .createQueryBuilder("user")
    .select(["user.name", "user.team"])
    .where("user.team = :team", { team: teamCode })
    .getMany();
  } catch (err) {
    throw new Error(`Lost connection to database (hub)! ${err}`);
  }
};

export const getUsersTeamRepo = async (teamCode: string): Promise<string> => {
  try {
    const usersTeam: Team = await getConnection("hub")
      .getRepository(Team)
      .findOne({ teamCode: teamCode });
    return (usersTeam ? usersTeam.repo : undefined);
  } catch (err) {
    throw new Error(`Lost connection to database (hub)! ${err}`);
  }
};