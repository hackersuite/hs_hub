import { Repository, getConnectionManager, ConnectionManager } from "typeorm";
import { injectable, decorate } from "inversify";

// First decorate the TypeORM base class repository with the injectable() annotation to prevent this error:
// Error: Missing required @injectable annotation in: Repository
decorate(injectable(), Repository);

@injectable()
export class BaseRepository<T> {
  protected connect(type: { new (): T } | string | Function): Repository<T> {
    let repository: Repository<T>;
    const connectionManager: ConnectionManager = getConnectionManager();
    if (connectionManager.connections.length > 0) {
      repository = connectionManager.get("hub").getRepository<T>(type);
    } else {
      throw "Connection to the database is not setup!";
    }
    return repository;
  }
}
