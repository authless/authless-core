import { IResourcePayload } from './resource'

/**
 * A entity usually extracted from a {@link IResponse} via {@link IResponse.toEntity}.
 *
 * @beta
 */
/* eslint-disable-next-line @typescript-eslint/no-empty-interface */
export interface IEntity { }

/**
 * A EntityConstructor used to build {@link IEntity} from {@link IResourcePayload | Resources}.
 *
 * @example
 *
 * ```ts
 * const response: IResponse = { ... }
 * const resourceResponse = response.toResources()
 * const entity = EntityConstructor.fromResources(resourceResponse.toArray())
 * ```
 *
 * @beta
 */
export interface IEntityConstructor {
  new (...args: any[]): IEntity
  fromResources: (resources: IResourcePayload[]) => IEntity
}
