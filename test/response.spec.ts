/* eslint-disable max-classes-per-file */
import * as fs from 'fs-extra'
import * as path from 'path'
import {
  ResourceConstructor,
  ResourcePayload,
  ResourceResponse,
  Response
} from '../src'

class TestResponse extends Response {
  /* eslint-disable-next-line class-methods-use-this */
  toResources (): TestResourceResponse {
    const resources: TestResourcePayload[] = [
      new TestResourcePayload(),
      new TestResourcePayload(),
    ]
    return new TestResourceResponse(
      ResourceConstructor.toHashResourcePair(resources)
    )
  }
}

class TestResourcePayload extends ResourcePayload {

}

class TestResourceResponse extends ResourceResponse<TestResourcePayload> {

}

const responseSerialized = fs.readJsonSync(
  path.join(__dirname, './fixtures/fullResponsePayload.json')
)

describe('Response', () => {
  test('it can be initialized', () => {
    const response = new TestResponse(responseSerialized)
    expect(response.meta.time).toBe(1583140599365)
  })

  test('it transforms to ResourceResponse', () => {
    const response = new TestResponse(responseSerialized)
    const resources = response.toResources()
    expect(resources).toBeInstanceOf(TestResourceResponse)
  })
})
