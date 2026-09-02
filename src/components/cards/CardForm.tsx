import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { createCard } from '../../lib/cards.client';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { toast } from 'sonner';

type FormValues = {
  name: string;
  phones: { value: string }[];
};

function validatePhone(value: string) {
  const digits = value.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

export const CardForm: React.FC<{ onCreated?: (id: string) => void }> = ({ onCreated }) => {
  const { register, control, handleSubmit, reset, formState } = useForm<FormValues>({
    defaultValues: { name: '', phones: [{ value: '' }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'phones' });

  const onSubmit = async (data: FormValues) => {
    try {
      const cleaned = data.phones.map((p) => p.value.trim());
      const card = await createCard({ name: data.name.trim(), phones: cleaned });
      toast.success('Card created');
      reset();
      onCreated?.(card.id as string);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create card');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Name</label>
        <Input {...register('name', { required: 'Name is required', minLength: 2 })} />
        {formState.errors.name && <p className="text-sm text-red-600">{formState.errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium">Phone numbers</label>
        {fields.map((f, i) => (
          <div key={f.id} className="flex gap-2 items-center mt-2">
            <Input
              {...register(`phones.${i}.value`, {
                required: 'Phone is required',
                validate: (v) => validatePhone(v) || 'Invalid phone number',
              })}
            />
            <Button type="button" variant="ghost" onClick={() => remove(i)}>
              Remove
            </Button>
          </div>
        ))}
        <div className="mt-2">
          <Button type="button" onClick={() => append({ value: '' })} variant="secondary">
            Add phone
          </Button>
        </div>
        {formState.errors?.phones && <p className="text-sm text-red-600">{(formState.errors as any).phones?.message}</p>}
      </div>

      <div>
        <Button type="submit">Create</Button>
      </div>
    </form>
  );
};

export default CardForm;
