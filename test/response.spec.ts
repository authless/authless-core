/* eslint-disable max-classes-per-file */
import * as fs from 'fs-extra'
import * as path from 'path'
import {
  Resource,
  ResourceCollection,
  ResourceConstructor,
  Response
} from '../src'

class TestResponse extends Response {
  /* eslint-disable-next-line class-methods-use-this */
  toResources (): TestResourceCollection {
    const resources: TestResource[] = [
      new TestResource(),
      new TestResource(),
    ]
    return new TestResourceCollection(
      ResourceConstructor.toHashResourcePair(resources)
    )
  }
}

class TestResource extends Resource {

}

class TestResourceCollection extends ResourceCollection<TestResource> {

}

const responseSerialized = fs.readJsonSync(
  path.join(__dirname, './fixtures/fullResponsePayload.json')
)

describe('Response', () => {
  test('it can be initialized', () => {
    const response = new TestResponse(responseSerialized)
    expect(response.meta.timestamp).toBe(1583140599365)
  })

  test('it transforms to ResourceCollection', () => {
    const response = new TestResponse(responseSerialized)
    const resources = response.toResources()
    expect(resources).toBeInstanceOf(TestResourceCollection)
  })
})
