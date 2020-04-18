import { Repository } from "typeorm";
import { User, MapLocation } from "../../db/entity";
import { injectable, inject } from "inversify";
import { MapRepository } from "../../repositories";
import { TYPES } from "../../types";
import axios from "axios";

export interface MapServiceInterface {
  getAll: () => Promise<MapLocation[]>;
  add: () => Promise<void>;
}

@injectable()
export class MapService {
  private mapRepository: Repository<MapLocation>;

  constructor(@inject(TYPES.MapRepository) _mapRepository: MapRepository) {
    this.mapRepository = _mapRepository.getRepository();
  }

  public getAll = async (): Promise<MapLocation[]> => {
    return this.mapRepository.find();
  };

  public add = async (city: string, country: string) => {
    const result = (
      await axios.get("http://api.positionstack.com/v1/forward", {
        params: {
          access_key: process.env.POSITIONSTACK_API_KEY,
          query: city,
          country,
          limit: 1
        }
      })
    ).data;

    if (result.data[0]) {
      const lat = result.data[0].latitude;
      const lng = result.data[0].longitude;
      const newLocation: MapLocation = new MapLocation(lat, lng, city);
      try {
        await this.mapRepository.save(newLocation);
      } catch (err) {
        return "Failed to save location";
      }
    } else {
      return "Failed geocoding";
    }
  };
}
