import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AutocompleteField } from './AutocompleteField'

const mockOptions = ['WS', 'MID', 'CU', 'FP', 'OBJ-L', 'OBJ-R', 'UNDER']

describe('AutocompleteField', () => {
  let onChange: ReturnType<typeof vi.fn>
  let onOtherChange: ReturnType<typeof vi.fn>

  beforeEach(() => {
    onChange = vi.fn()
    onOtherChange = vi.fn()
  })

  describe('Basic Input & Filtering', () => {
    it('should render input field with placeholder', () => {
      render(
        <AutocompleteField
          value={null}
          onChange={onChange}
          options={mockOptions}
          allowOther={false}
          placeholder="Select a shot type"
        />
      )

      const input = screen.getByPlaceholderText('Select a shot type')
      expect(input).toBeInTheDocument()
    })

    it('should show filtered suggestions as user types', async () => {
      const user = userEvent.setup()
      render(
        <AutocompleteField
          value={null}
          onChange={onChange}
          options={mockOptions}
          allowOther={false}
        />
      )

      const input = screen.getByRole('textbox')
      await user.type(input, 'WS')

      expect(screen.getByText('WS')).toBeInTheDocument()
    })

    it('should filter options case-insensitively', async () => {
      const user = userEvent.setup()
      render(
        <AutocompleteField
          value={null}
          onChange={onChange}
          options={mockOptions}
          allowOther={false}
        />
      )

      const input = screen.getByRole('textbox')
      await user.type(input, 'ws')

      expect(screen.getByText('WS')).toBeInTheDocument()
    })

    it('should not show dropdown when no matches', async () => {
      const user = userEvent.setup()
      render(
        <AutocompleteField
          value={null}
          onChange={onChange}
          options={mockOptions}
          allowOther={false}
        />
      )

      const input = screen.getByRole('textbox')
      await user.type(input, 'ZZZZ')

      expect(screen.queryByRole('option')).not.toBeInTheDocument()
    })
  })

  describe('Selection & Auto-Save on Blur', () => {
    it('should call onChange with exact match when blurring after exact match', async () => {
      const user = userEvent.setup()
      const { rerender } = render(
        <AutocompleteField
          value={null}
          onChange={onChange}
          options={mockOptions}
          allowOther={false}
        />
      )

      const input = screen.getByRole('textbox') as HTMLInputElement
      await user.type(input, 'WS')
      await user.tab() // Blur

      expect(onChange).toHaveBeenCalledWith('WS')
    })

    it('should save value when selecting from dropdown', async () => {
      const user = userEvent.setup()
      render(
        <AutocompleteField
          value={null}
          onChange={onChange}
          options={mockOptions}
          allowOther={false}
        />
      )

      const input = screen.getByRole('textbox')
      await user.type(input, 'CU')

      // CU should match CU exactly
      const cuOption = screen.getByText('CU')
      await user.click(cuOption)

      expect(onChange).toHaveBeenCalledWith('CU')
    })

    it('should clear value when input is empty and blurred', async () => {
      const user = userEvent.setup()
      render(
        <AutocompleteField
          value="WS"
          onChange={onChange}
          options={mockOptions}
          allowOther={false}
        />
      )

      const input = screen.getByRole('textbox') as HTMLInputElement
      expect(input.value).toBe('WS')

      await user.clear(input)
      await user.tab() // Blur

      expect(onChange).toHaveBeenCalledWith(null)
    })

    it('should reset to previous value when no match found on fixed list (allowOther=false)', async () => {
      const user = userEvent.setup()
      const { rerender } = render(
        <AutocompleteField
          value="WS"
          onChange={onChange}
          options={mockOptions}
          allowOther={false}
        />
      )

      const input = screen.getByRole('textbox') as HTMLInputElement
      expect(input.value).toBe('WS')

      // Type non-matching value
      await user.clear(input)
      await user.type(input, 'INVALID')
      await user.tab() // Blur

      // Should reset to "WS"
      expect(input.value).toBe('WS')
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  describe('Keyboard Navigation', () => {
    it('should navigate suggestions with arrow keys', async () => {
      const user = userEvent.setup()
      render(
        <AutocompleteField
          value={null}
          onChange={onChange}
          options={mockOptions}
          allowOther={false}
        />
      )

      const input = screen.getByRole('textbox')
      await user.type(input, 'O')

      // Press ArrowDown to select first option
      await user.keyboard('{ArrowDown}')
      const firstOption = screen.getAllByRole('option')[0]
      expect(firstOption).toHaveClass('selected')
    })

    it('should select option with Enter key', async () => {
      const user = userEvent.setup()
      render(
        <AutocompleteField
          value={null}
          onChange={onChange}
          options={mockOptions}
          allowOther={false}
        />
      )

      const input = screen.getByRole('textbox')
      await user.type(input, 'CU')
      await user.keyboard('{ArrowDown}')
      await user.keyboard('{Enter}')

      expect(onChange).toHaveBeenCalledWith('CU')
    })

    it('should reset input value with Escape key', async () => {
      const user = userEvent.setup()
      render(
        <AutocompleteField
          value="WS"
          onChange={onChange}
          options={mockOptions}
          allowOther={false}
        />
      )

      const input = screen.getByRole('textbox') as HTMLInputElement
      expect(input.value).toBe('WS')

      // Type something else
      await user.clear(input)
      await user.type(input, 'XY')
      expect(input.value).toBe('XY')

      // Press Escape
      await user.keyboard('{Escape}')

      // Should reset to previous value
      expect(input.value).toBe('WS')
    })
  })

  describe('"Other" Option Handling (allowOther=true)', () => {
    it('should show "Add as Other" option for non-matching input', async () => {
      const user = userEvent.setup()
      render(
        <AutocompleteField
          value={null}
          onChange={onChange}
          options={mockOptions}
          allowOther={true}
        />
      )

      const input = screen.getByRole('textbox')
      await user.type(input, 'CUSTOM')

      expect(screen.getByText(/Add "CUSTOM" as Other/)).toBeInTheDocument()
    })

    it('should show validation dialog when clicking "Add as Other"', async () => {
      const user = userEvent.setup()
      render(
        <AutocompleteField
          value={null}
          onChange={onChange}
          onOtherChange={onOtherChange}
          options={mockOptions}
          allowOther={true}
        />
      )

      const input = screen.getByRole('textbox')
      await user.type(input, 'CUSTOM')

      const addOtherButton = screen.getByText(/Add "CUSTOM" as Other/)
      await user.click(addOtherButton)

      expect(screen.getByText(/Confirm Custom Value/)).toBeInTheDocument()
      expect(screen.getByText(/"CUSTOM" is not in the predefined options/)).toBeInTheDocument()
    })

    it('should call onChange and onOtherChange when confirming "Other"', async () => {
      const user = userEvent.setup()
      render(
        <AutocompleteField
          value={null}
          onChange={onChange}
          onOtherChange={onOtherChange}
          options={mockOptions}
          allowOther={true}
        />
      )

      const input = screen.getByRole('textbox')
      await user.type(input, 'CUSTOM')

      const addOtherButton = screen.getByText(/Add "CUSTOM" as Other/)
      await user.click(addOtherButton)

      const confirmButton = screen.getByText(/Use "CUSTOM" as Other/)
      await user.click(confirmButton)

      expect(onChange).toHaveBeenCalledWith('Other')
      expect(onOtherChange).toHaveBeenCalledWith('CUSTOM')
    })

    it('should cancel validation dialog when clicking Cancel', async () => {
      const user = userEvent.setup()
      render(
        <AutocompleteField
          value={null}
          onChange={onChange}
          options={mockOptions}
          allowOther={true}
        />
      )

      const input = screen.getByRole('textbox') as HTMLInputElement
      await user.type(input, 'CUSTOM')

      const addOtherButton = screen.getByText(/Add "CUSTOM" as Other/)
      await user.click(addOtherButton)

      const cancelButton = screen.getByText('Cancel')
      await user.click(cancelButton)

      expect(onChange).not.toHaveBeenCalled()
      expect(input.value).toBe('')
    })

    it('should show validation dialog with message about unrecognized value', async () => {
      const user = userEvent.setup()
      render(
        <AutocompleteField
          value={null}
          onChange={onChange}
          options={mockOptions}
          allowOther={true}
        />
      )

      const input = screen.getByRole('textbox')
      await user.type(input, 'CUSTOM')

      const addOtherButton = screen.getByText(/Add "CUSTOM" as Other/)
      await user.click(addOtherButton)

      // Dialog should appear with confirmation message
      expect(screen.getByText(/Confirm Custom Value/)).toBeInTheDocument()
      expect(screen.getByText(/"CUSTOM" is not in the predefined options/)).toBeInTheDocument()
    })
  })

  describe('Conditional "Other" Text Input', () => {
    it('should show conditional text input when showOtherText=true and value="Other"', () => {
      render(
        <AutocompleteField
          value="Other"
          onChange={onChange}
          onOtherChange={onOtherChange}
          options={mockOptions}
          allowOther={true}
          showOtherText={true}
          otherValue="Custom value"
        />
      )

      const otherInput = screen.getByPlaceholderText('Enter custom value...')
      expect(otherInput).toBeInTheDocument()
      expect((otherInput as HTMLInputElement).value).toBe('Custom value')
    })

    it('should not show conditional text input when value is not "Other"', () => {
      render(
        <AutocompleteField
          value="WS"
          onChange={onChange}
          onOtherChange={onOtherChange}
          options={mockOptions}
          allowOther={true}
          showOtherText={true}
          otherValue="Custom value"
        />
      )

      const otherInput = screen.queryByPlaceholderText('Enter custom value...')
      expect(otherInput).not.toBeInTheDocument()
    })

    it('should call onOtherChange when typing and blurring Other text input', async () => {
      const user = userEvent.setup()
      render(
        <AutocompleteField
          value="Other"
          onChange={onChange}
          onOtherChange={onOtherChange}
          options={mockOptions}
          allowOther={true}
          showOtherText={true}
          otherValue={null}
        />
      )

      const otherInput = screen.getByPlaceholderText('Enter custom value...') as HTMLInputElement
      await user.type(otherInput, 'Demo')

      // Blur to trigger save
      await user.tab()

      // onOtherChange should have been called
      expect(onOtherChange).toHaveBeenCalled()
    })
  })

  describe('Loading State', () => {
    it('should show spinner when isLoading=true', () => {
      render(
        <AutocompleteField
          value={null}
          onChange={onChange}
          options={mockOptions}
          allowOther={false}
          isLoading={true}
        />
      )

      const spinner = screen.getByText('⟳')
      expect(spinner).toBeInTheDocument()
    })

    it('should disable input when isLoading=true', () => {
      render(
        <AutocompleteField
          value={null}
          onChange={onChange}
          options={mockOptions}
          allowOther={false}
          isLoading={true}
        />
      )

      const input = screen.getByRole('textbox') as HTMLInputElement
      expect(input.disabled).toBe(true)
    })
  })

  describe('Disabled State', () => {
    it('should disable input when disabled=true', () => {
      render(
        <AutocompleteField
          value={null}
          onChange={onChange}
          options={mockOptions}
          allowOther={false}
          disabled={true}
        />
      )

      const input = screen.getByRole('textbox') as HTMLInputElement
      expect(input.disabled).toBe(true)
    })
  })
})
