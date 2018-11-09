import { getConnection } from "typeorm";
import { User } from "../../db/entity/hub";

export const updateUserWithTeamCode = async (userID: number, userTeamCode: string, newTeam: boolean): Promise<boolean> => {
  try {
    if (!newTeam && !(await checkTeamExists(userTeamCode)))
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

export const checkTeamExists = async (userTeamCode: string): Promise<boolean> => {
  try {
    const teamCodeValid: boolean = await getConnection("hub")
    .getRepository(User)
    .createQueryBuilder()
    .where("team = :teamCode", {teamCode: userTeamCode})
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
    .select(["user.name", "user.email", "user.team"])
    .where("user.team != :empty", { empty: "" })
    .getMany();
  } catch (err) {
    throw new Error(`Lost connection to database (hub)! ${err}`);
  }
};

export const getUsersTeam = async (teamCode: string): Promise<User[]> => {
  return await getConnection("hub")
      .getRepository(User)
      .createQueryBuilder("user")
      .select(["user.name", "user.email", "user.team"])
      .where("user.team = :team", { team: teamCode })
      .getMany();
};