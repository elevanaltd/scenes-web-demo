import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DropdownProvider, useDropdown } from './DropdownContext'

function TestComponent() {
  const { activeDropdownId, setActiveDropdownId } = useDropdown()
  return (
    <div>
      <div data-testid="active-id">{activeDropdownId || 'none'}</div>
      <button onClick={() => setActiveDropdownId('dropdown-1')}>Open 1</button>
      <button onClick={() => setActiveDropdownId('dropdown-2')}>Open 2</button>
      <button onClick={() => setActiveDropdownId(null)}>Close All</button>
    </div>
  )
}

describe('DropdownContext', () => {
  it('should provide initial state as null (no dropdown open)', () => {
    render(
      <DropdownProvider>
        <TestComponent />
      </DropdownProvider>
    )

    expect(screen.getByTestId('active-id')).toHaveTextContent('none')
  })

  it('should allow setting active dropdown ID', () => {
    render(
      <DropdownProvider>
        <TestComponent />
      </DropdownProvider>
    )

    const openButton1 = screen.getByRole('button', { name: 'Open 1' })
    fireEvent.click(openButton1)

    expect(screen.getByTestId('active-id')).toHaveTextContent('dropdown-1')
  })

  it('should allow switching between different dropdowns', () => {
    render(
      <DropdownProvider>
        <TestComponent />
      </DropdownProvider>
    )

    const openButton1 = screen.getByRole('button', { name: 'Open 1' })
    const openButton2 = screen.getByRole('button', { name: 'Open 2' })

    fireEvent.click(openButton1)
    expect(screen.getByTestId('active-id')).toHaveTextContent('dropdown-1')

    fireEvent.click(openButton2)
    expect(screen.getByTestId('active-id')).toHaveTextContent('dropdown-2')
  })

  it('should allow closing all dropdowns', () => {
    render(
      <DropdownProvider>
        <TestComponent />
      </DropdownProvider>
    )

    const openButton1 = screen.getByRole('button', { name: 'Open 1' })
    const closeButton = screen.getByRole('button', { name: 'Close All' })

    fireEvent.click(openButton1)
    expect(screen.getByTestId('active-id')).toHaveTextContent('dropdown-1')

    fireEvent.click(closeButton)
    expect(screen.getByTestId('active-id')).toHaveTextContent('none')
  })

  it('should throw error when useDropdown is used outside provider', () => {
    // Suppress console.error for this test
    const consoleError = console.error
    console.error = () => {}

    expect(() => {
      render(<TestComponent />)
    }).toThrow('useDropdown must be used within DropdownProvider')

    console.error = consoleError
  })
})
