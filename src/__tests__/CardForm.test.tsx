import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../lib/cards.client', () => ({
  createCard: vi.fn(() => Promise.resolve({ id: 'x' })),
}));

import CardForm from '../components/cards/CardForm';
import * as client from '../lib/cards.client';

describe('CardForm', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('submits valid data', async () => {
    render(<CardForm />);
    const name = screen.getByLabelText(/Name/i);
    fireEvent.change(name, { target: { value: 'Test' } });
    const phone = screen.getByPlaceholderText ? screen.getByPlaceholderText('') : screen.getByRole('textbox');

    // fallback if specific placeholder isn't present
    fireEvent.change(phone, { target: { value: '+1234567890' } });
    fireEvent.click(screen.getByText(/Create/i));

    await waitFor(() => expect((client as any).createCard).toHaveBeenCalled());
  });
});
