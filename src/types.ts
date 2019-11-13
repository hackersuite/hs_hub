export const TYPES = {
    RequestAuthentication: Symbol.for("RequestAuthentication"),
    Cache: Symbol.for("Cache")
};


export interface RequestTeam {
  teamID: string;
  teamName: string;
  teamCreator: string;
}

export interface NewTeamObject {
  teamID: string;
  teamName: string;
  repo?: string;
  tableNumber?: number;
  users: RequestUser[];
}

export interface RequestTeamObject {
  status: number;
  error: string;
  teams: RequestTeam[];
}

export interface RequestUser {
  authId: string;
  authLevel: number;
  name: string;
  email: string;
  team: string;
}

export interface TeamMembers {
  status: number;
  error: string;
  users: RequestUser[];
}