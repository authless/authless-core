import { IEntity, IEntityConstructor } from './entity'
import { IResourcePayload, IResourceResponse } from './resource'

/**
 * The raw response from a service including any (xhrs) requests and responses and meta information.
 *
 * @remarks
 *
 * A {@link IResponse} can be transformed into {@link IResourceResponse} or {@link IEntity} responses
 * which extract the more and the most relevant data from an {@link IResponse}.
 *
 * Service repositories should create their own response class implementing {@link IResponse}.
 *
 * @privateRemarks
 *
 * - Serializable: TRUE
 * - Serialization Format: Avro
 *
 * @beta
 */
export interface IResponse {

  /**
   * Meta data about response. See {@link IResponseMeta}.
   */
  meta: IResponseMeta

  /**
   * The main page response. See {@link IResponsePage}.
   */
  page: IResponsePage

  /**
   * The page body (usually html) of the response.
   *
   * @deprecated Can be omitted as its available via {@link IResponsePage.content}
   */
  content?: string

  /**
   * The main request & response chain. See {@link IResponseResponse}.
   */
  main: IResponseResponse

  /**
   * Any XHR request & responses. See {@link IResponseResponse}.
   */
  xhrs: IResponseResponse[]

  /**
   * Creates a {@link IResponseResponse} from an {@link IResponse} instance.
   */
  toResources(): IResourceResponse<IResourcePayload>

  /**
   * Creates an {@link IEntity} from an {@link IResponse} instance.
   */
  toEntity(entity: IEntityConstructor): IEntity
}

/**
 * Sub-type of {@link IResponse}.
 *
 * @privateRemarks
 *
 * - Serializable: TRUE
 * - Serialization Format: Avro
 *
 * @beta
 */
export interface IResponseMeta {
  account: string
  time: number
}

/**
 * Sub-type of {@link IResponse}.
 *
 * @privateRemarks
 *
 * - Serializable: TRUE
 * - Serialization Format: Avro
 *
 * @beta
 */
export interface IResponsePage {
  url: string
  viewport?: any
  content: string
  cookies: any[]
  title: string
}

/**
 * Sub-type of {@link IResponse}.
 *
 * @privateRemarks
 *
 * - Serializable: TRUE
 * - Serialization Format: Avro
 *
 * @beta
 */
export interface IResponseRequest {
  headers: string
  isNavigationRequest: boolean
  method: string
  postData: any
  resourceType: string
  url: string
  redirectChain: IResponseRequest[]
}

/**
 * Sub-type of {@link IResponse}.
 *
 * @privateRemarks
 *
 * - Serializable: TRUE
 * - Serialization Format: Avro
 *
 * @beta
 */
export interface IResponseResponse {
  request: IResponseRequest
  url: number
  status: string
  statusText: string
  headers: any
  securityDetails: any
  fromCache: string
  fromServiceWorker: string
  text: string
}
