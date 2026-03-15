import { test, expect } from '@playwright/test'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const WSDL_URL = 'https://example.com/stockquote?wsdl'

function fixture(name: string): string {
  return readFileSync(join(__dirname, 'fixtures', name), 'utf-8')
}

function mockWsdlFetch(page: import('@playwright/test').Page, fixtureFile = 'wsdl11-document.xml') {
  return page.route('**/stockquote?wsdl*', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'text/xml',
      body: fixture(fixtureFile),
    }),
  )
}

async function loadWsdlFromUrl(page: import('@playwright/test').Page) {
  await mockWsdlFetch(page)
  await page.getByPlaceholder('Paste a WSDL URL...').fill(WSDL_URL)
  await page.getByRole('button', { name: 'Explore' }).click()
  await expect(page.getByText('StockQuoteService')).toBeVisible()
}

/** Expand the first endpoint group to reveal operations */
async function expandFirstGroup(page: import('@playwright/test').Page) {
  await page.getByText('1 operation').click()
}

test.describe('WSDL Explorer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('shows empty state on load', async ({ page }) => {
    await expect(page.getByText('Explore a WSDL service')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Explore' })).toBeDisabled()
  })

  test('loads WSDL from URL and displays service', async ({ page }) => {
    await loadWsdlFromUrl(page)

    await expect(page.getByText('StockQuoteService')).toBeVisible()
    await expect(page.getByText('StockQuotePort')).toBeVisible()
    await expect(page.getByText('1 operation')).toBeVisible()

    // Expand group to see operations
    await expandFirstGroup(page)
    await expect(page.getByTestId('operation-GetLastTradePrice')).toBeVisible()
  })

  test('loads WSDL from file upload', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(join(__dirname, 'fixtures', 'wsdl11-rpc.xml'))

    await expect(page.getByText('CalculatorService')).toBeVisible()
    await expect(page.getByText('CalculatorPort')).toBeVisible()

    // Expand group
    await page.getByText('1 operation').click()
    await expect(page.getByTestId('operation-Add')).toBeVisible()
  })

  test('expands operation to show details', async ({ page }) => {
    await loadWsdlFromUrl(page)
    await expandFirstGroup(page)

    await page.getByTestId('operation-toggle-GetLastTradePrice').click()

    const detail = page.getByTestId('operation-GetLastTradePrice')
    await expect(detail.getByText('Endpoint')).toBeVisible()
    await expect(detail.getByText('SOAPAction')).toBeVisible()
    await expect(detail.getByText('SOAP 1.1 / document')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Try it out' })).toBeVisible()
  })

  test('enables try-it-out mode with editable XML and execute button', async ({ page }) => {
    await loadWsdlFromUrl(page)
    await expandFirstGroup(page)

    await page.getByTestId('operation-toggle-GetLastTradePrice').click()
    await page.getByRole('button', { name: 'Try it out' }).click()

    const textarea = page.locator('textarea')
    await expect(textarea).toBeVisible()
    await expect(textarea).toContainText('Envelope')
    await expect(page.getByRole('button', { name: 'Execute' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible()
  })

  test('executes SOAP request and displays response', async ({ page }) => {
    await loadWsdlFromUrl(page)

    // Mock the SOAP endpoint
    await page.route('**/stockquote', (route) => {
      if (route.request().method() === 'POST') {
        return route.fulfill({
          status: 200,
          contentType: 'text/xml',
          body: `<?xml version="1.0"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetLastTradePriceResponse xmlns="http://example.com/stockquote">
      <price>182.5</price>
    </GetLastTradePriceResponse>
  </soap:Body>
</soap:Envelope>`,
        })
      }
      return route.continue()
    })

    await expandFirstGroup(page)
    await page.getByTestId('operation-toggle-GetLastTradePrice').click()
    await page.getByRole('button', { name: 'Try it out' }).click()
    await page.getByRole('button', { name: 'Execute' }).click()

    await expect(page.getByText('200')).toBeVisible()
    await expect(page.getByText('182.5')).toBeVisible()
  })

  test('displays service and operation documentation', async ({ page }) => {
    await loadWsdlFromUrl(page)

    // Service-level documentation in the header
    await expect(page.getByText('Provides real-time stock quote information.')).toBeVisible()

    // Operation-level documentation in the detail view
    await expandFirstGroup(page)
    await page.getByTestId('operation-toggle-GetLastTradePrice').click()
    await expect(
      page.getByText('Returns the last recorded trade price for a given ticker symbol.'),
    ).toBeVisible()
  })

  test('shows error when WSDL fetch fails', async ({ page }) => {
    await page.route('**/bad-service?wsdl*', (route) =>
      route.fulfill({ status: 500, body: 'Internal Server Error' }),
    )

    await page.getByPlaceholder('Paste a WSDL URL...').fill('https://example.com/bad-service?wsdl')
    await page.getByRole('button', { name: 'Explore' }).click()

    await expect(page.getByText('Failed to fetch WSDL')).toBeVisible()
  })
})
