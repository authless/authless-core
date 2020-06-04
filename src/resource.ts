/* eslint-disable max-classes-per-file */
import hash from 'object-hash'

/**
 * Holds none, one, or many {@link IResourcePayload | Resources} and is usually created
 * via {@link IResponse.toResources}.
 *
 * @beta
 */
export interface IResourceResponse<T extends IResourcePayload> {

  /**
   * Create an Array of {@link IResourcePayload | Resources}. Omits keys.
   */
  toArray (): T[]
}

/**
 * Abstract implementation of {@link IResourceResponse}. Extends {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map | Map}.
 *
 * @beta
 */
export abstract class ResourceResponse<T extends IResourcePayload> extends Map<string, T> {

  /**
   * see {@link IResourceResponse}
   */
  toArray (): T[] {
    return Array.from(this.values())
  }
}

/**
 * @beta
 */
export interface IResourcePayload {

  /**
   * Creates the sha1 hash of the resource.
   *
   * @remarks
   * If the resource has noisy attributes such as trackingIDs or debugging info that is not
   * relevant to the resource as such, the implementation may decide to omit such attributes
   * to produce the same sha1 hash for resources that would e.g. otherwise have different trackingID values.
   *
   * @example
   *
   * ```ts
   * // example implementation of the sha1 function which omits the `trackingNumber` property
   * function sha1 (object): string {
   *   const clone = { ...object }
   *   Reflect.deleteProperty(clone, 'trackingNumber')
   *   return hash(clone, { algorithm: 'sha1' })
   * }
   *
   * // Returns true
   * sha1({value: 1, trackingNumber: '123'}) === sha1({value: 1, trackingNumber: '456'})
   * ```
   */
  sha1 (): string
}

/**
 * @beta
 */
export abstract class ResourcePayload implements IResourcePayload {

  /**
   * See {@link IResourcePayload.sha1}.
   *
   * @remarks
   * Does not omit any properties of the resource
   */
  sha1 (): string {
    return hash(this, { algorithm: 'sha1' })
  }
}

/**
 * @beta
 */
export const ResourceConstructor = {

  /**
   * Generates the `sha1` hash of any resource object and returns the sha1-resource pair.
   *
   * @remarks
   * This allows downstream tasks to easily compute a list that only contains unique
   * values by filtering out duplicate sha1 keys. See the example for usage.
   *
   * @example
   *
   * ```ts
   * // to create a ResourceResponse that has only unique and no duplicate resources
   * const resources: IResourcePayload[] = [{}, {}, ...]
   * const uniqueResourceResponse = new ResourceResponse(
   *   ResourceConstructor.toHashResourcePair(resources)
   * )
   * ```
   *
   * @returns An array for sha1-resource pairs. For example:
   *          [
   *            [ 'SHA1-1234', {@link IResourcePayload} ],
   *            [ 'SHA1-5678', {@link IResourcePayload} ],
   *          ]
   */
  toHashResourcePair<T extends IResourcePayload>(resources: T[]): Array<[string, T]> {
    return resources.map(resource => {
      return [hash(resource.sha1(), { algorithm: 'sha1' }), resource]
    })
  }
}
