import { buildApp } from "../../../../src/app";
import { getConnection } from "typeorm";
import { User, Team } from "../../../../src/db/entity/hub";
import { Express } from "express";
import { checkTeamExists, createOrAddTeam, getUsersTeamMembers, leaveTeam, getUsersTeam, createTeam, updateUserWithTeamCode, joinTeam, updateTeamRepository, updateTeamTableNumber, getAllUsersInTeams } from "../../../../src/util/team/teamValidation";
import { getUserByIDFromHub } from "../../../../src/util/user";


let bApp: Express;

const HTTP_OK: number = 200;
const HTTP_FAIL: number = 401;

const TEST_PASSWORD: string = "pbkdf2_sha256$30000$xmAiV8Wihzn5$BBVJrxmsVASkYuOI6XdIZoYLfy386hdMOF8S14WRTi8=";

let testHubUser: User = new User();
let testHubUserNoTeam: User = new User();

const testHubTeam: Team = new Team();

testHubUser.name = "Billy Tester II";
testHubUser.email = "billyII@testing-validation.com";
testHubUser.password = TEST_PASSWORD;
testHubUser.authLevel = 1;
testHubUser.team = "TeamCodeHere-";

testHubUserNoTeam.name = "Billy Tester No Team";
testHubUserNoTeam.email = "billyI@testing-validation.com";
testHubUserNoTeam.password = TEST_PASSWORD;
testHubUserNoTeam.authLevel = 0;

testHubTeam.teamCode = testHubUser.team;

/**
 * Preparing for the tests
 */
beforeAll((done: jest.DoneCallback): void => {
  buildApp(async (builtApp: Express, err: Error): Promise<void> => {
    if (err) {
      console.error("Could not start server!");
      done();
    } else {
      bApp = builtApp;

      // Creating the test user in the hub
      testHubUser.id = (await getConnection("hub")
        .createQueryBuilder()
        .insert()
        .into(User)
        .values([testHubUser])
        .execute()).identifiers[0].id;
      testHubUserNoTeam.id = (await getConnection("hub")
        .createQueryBuilder()
        .insert()
        .into(User)
        .values([testHubUserNoTeam])
        .execute()).identifiers[0].id;

      await getConnection("hub")
        .createQueryBuilder()
        .insert()
        .into(Team)
        .values([testHubTeam])
        .execute();
      done();
    }
  });
});


/**
 * User validation tests
 */
describe("Team validation tests", (): void => {
  /**
   * Test that a user can join a current team
   */
  test("Should ensure that a user can join a team that exists in the hub database", async (): Promise<void> => {
    // Add the no-team-user to the test team
    await createOrAddTeam(testHubUserNoTeam.id, testHubTeam.teamCode);
    testHubUserNoTeam = await getUserByIDFromHub(testHubUserNoTeam.id);

    // Checks that the required user exists in the team
    let teamMembers: User[] = await getUsersTeamMembers(testHubTeam.teamCode);
    expect(teamMembers).toContainEqual({name: testHubUserNoTeam.name, team: testHubUserNoTeam.team});

    const usersTeam: Team = await getUsersTeam(testHubUserNoTeam.team);
    expect({ teamCode: usersTeam.teamCode }).toEqual(testHubTeam);

    // Leave the team and check that the user left the team
    await leaveTeam(testHubUserNoTeam.id, testHubUserNoTeam.team);
    testHubUserNoTeam = await getUserByIDFromHub(testHubUserNoTeam.id);

    teamMembers = await getUsersTeamMembers(testHubTeam.teamCode);
    expect(teamMembers).not.toContainEqual({name: testHubUserNoTeam.name, team: testHubUser.team});
  });

  /**
   * Test that a user can leave a team when they have joined it
   */
  test("Should ensure that the user can leave the team once they have joined", async (): Promise<void> => {

    // We should be the only user to the team will be deleted
    const result: boolean = await leaveTeam(testHubUser.id, testHubUser.team);
    expect(result).toBeTruthy();
    const teamExists: boolean = await checkTeamExists(testHubTeam.repo);
    expect(teamExists).toBeFalsy();

    // Update the test user
    testHubUser = await getUserByIDFromHub(testHubUser.id);

    // Check that the user is no longer in the team
    const teamMembers: User[] = await getUsersTeamMembers(testHubTeam.teamCode);
    expect(teamMembers).not.toContainEqual({name: testHubUser.name, team: testHubTeam.teamCode});

    // Insert the team and the user and check it worked
    await createTeam(testHubTeam.teamCode);
    await createOrAddTeam(testHubUser.id, testHubTeam.teamCode);

    testHubUser = await getUserByIDFromHub(testHubUser.id);

    const isInTeamAfterSave: User[] = await getUsersTeamMembers(testHubUser.team);
    expect(isInTeamAfterSave).toContainEqual({name: testHubUser.name, team: testHubUser.team});
  });

  /**
   * Test if the team exists in the database and if the team can be found by the team code
   */
  test("Should ensure that a team can be found by team code", async (): Promise<void> => {
    const testTeamExists: boolean = await checkTeamExists(testHubTeam.teamCode);
    expect(testTeamExists).toBeTruthy();

    const testTeamExistsFromUser: boolean = await checkTeamExists(testHubUser.team);
    expect(testTeamExistsFromUser).toBeTruthy();

    const testTeamExistsWhenInvalidTeam: boolean = await checkTeamExists("qwertyuiopasd");
    expect(testTeamExistsWhenInvalidTeam).toBeFalsy();
  });

  /**
   * Test if a invalid team code, we should get a false return code
   */
  test("Should ensure the an invalid team code does not exist in the hub database", async (): Promise<void> => {
    const testTeamExists: boolean = await checkTeamExists("TeamCodeIsTooLongForTheField");
    expect(testTeamExists).toBeFalsy();
  });

  /**
   * Test if a user can join a non-existant team
   */
  test("Should ensure that a user cannot join a team that does not exist", async (): Promise<void> => {
    const userJoined: boolean = await joinTeam(testHubUser.id, "TeamNotExist");
    expect(userJoined).toBeFalsy();
  });

  /**
   * Test if a team can be created and then deleted
   */
  test("Should ensure that a new team can be created", async (): Promise<void> => {
    const newTeamCode: string = "qwertyuiop";
    await createOrAddTeam(testHubUser.id, newTeamCode);

    let teamExists: boolean = await checkTeamExists(newTeamCode);
    expect(teamExists).toBeTruthy();

    await getConnection("hub")
      .getRepository(Team)
      .delete({ teamCode: newTeamCode });

    teamExists = await checkTeamExists(newTeamCode);
    expect(teamExists).toBeFalsy();

    const result: boolean = await createTeam(newTeamCode);
    expect(result).toBeTruthy();

    teamExists = await checkTeamExists(newTeamCode);
    expect(teamExists).toBeTruthy();

    await getConnection("hub")
      .getRepository(Team)
      .delete({ teamCode: newTeamCode });

    const teamExistsAfterDelete: boolean = await checkTeamExists(newTeamCode);
    expect(teamExistsAfterDelete).toBeFalsy();
  });

  /**
   * Test that we can directly update a users team code
   */
  test("Should ensure we can directly update a users team code and added to the team", async (): Promise<void> => {
    // Check the user does not exist in the team
    let teamMembers: User[] = await getUsersTeamMembers(testHubTeam.teamCode);
    expect(teamMembers).not.toContainEqual({name: testHubUserNoTeam.name, team: testHubUserNoTeam.team});

    // Manually add the user to the team and get the updated user from the database
    const response: boolean = await updateUserWithTeamCode(testHubUserNoTeam.id, testHubTeam.teamCode);
    expect(response).toBeTruthy();
    testHubUserNoTeam = await getUserByIDFromHub(testHubUserNoTeam.id);

    // Check that the user exists in the team
    teamMembers = await getUsersTeamMembers(testHubTeam.teamCode);
    expect(teamMembers).toContainEqual({name: testHubUserNoTeam.name, team: testHubUserNoTeam.team});
  });

  /**
   * Test if a teams repository can be updated
   */
  test("Should ensure that a teams repoisitory can be updated", async (): Promise<void> => {
    const newRepo: string = "https://github.com/project.git";

    const result: boolean = await updateTeamRepository(testHubTeam.teamCode, newRepo);
    expect(result).toBeTruthy();

    const updatedTeam: Team = await getUsersTeam(testHubTeam.teamCode);
    expect(updatedTeam.repo).toBe(newRepo);

    const resultInvalidCode: boolean = await updateTeamRepository("qwertyup0", newRepo);
    expect(resultInvalidCode).toBeFalsy();
  });

  /**
   * Test if a teams table number can be updated
   */
  test("Should ensure that a teams table number can be updated", async (): Promise<void> => {
    const newTable: number = 100;

    const result: boolean = await updateTeamTableNumber(testHubTeam.teamCode, 100);
    expect(result).toBeTruthy();

    const updatedTeam: Team = await getUsersTeam(testHubTeam.teamCode);
    expect(updatedTeam.tableNumber).toBe(newTable);

    const resultInvalidNumber: boolean = await updateTeamTableNumber("qwertyup0", newTable);
    expect(resultInvalidNumber).toBeFalsy();
  });

  /**
   * Test if we can find all the users in every team
   */
  test("Should ensure we get all the users in all the teams", async (): Promise<void> => {
    const allUsers: User[] = await getAllUsersInTeams();
    expect(allUsers.length).toBeGreaterThanOrEqual(1);
  });

});

/**
 * Cleaning up after the tests
 */
afterAll(async (): Promise<void> => {
  await getConnection("hub")
    .createQueryBuilder()
    .delete()
    .from(User)
    .where("id = :id", { id: testHubUser.id })
    .execute();

  await getConnection("hub")
    .createQueryBuilder()
    .delete()
    .from(User)
    .where("id = :id", { id: testHubUserNoTeam.id })
    .execute();

  await getConnection("hub")
    .createQueryBuilder()
    .delete()
    .from(Team)
    .where("teamCode = :teamCode", {teamCode: testHubTeam.teamCode})
    .execute();

  await getConnection("applications").close();
  await getConnection("hub").close();
});
