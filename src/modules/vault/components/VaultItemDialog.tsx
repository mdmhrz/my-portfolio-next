'use client';

import { useState } from 'react';
import { z } from 'zod';
import { Plus, Trash2, Dices } from 'lucide-react';
import { VaultItemData, VaultFieldData } from '@/store/usePortfolioStore';
import { FormDialog } from '@/components/admin/FormDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { generatePassword, generateSecret, SecretKind } from '@/modules/vault/service/generators';
import { VAULT_FIELD_TYPES } from './vault-constants';

const vaultItemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  category: z.string().min(1, 'Category is required'),
});

const MULTILINE_TYPES = ['textarea', 'json', 'env'];

interface FieldForm {
  label: string;
  type: string;
  value: string;
}

interface VaultForm {
  id?: string;
  title: string;
  category: string;
  description: string;
  tags: string; // comma-separated, parsed to an array on submit
  favorite: boolean;
  expiresAt: string;
  fields: FieldForm[];
}

const emptyForm: VaultForm = {
  title: '', category: '', description: '', tags: '', favorite: false, expiresAt: '',
  fields: [{ label: '', type: 'password', value: '' }],
};

export interface VaultItemSubmitData {
  title: string;
  category: string;
  description: string | null;
  tags: string[];
  favorite: boolean;
  expiresAt: string | null;
  fields: { label: string; type?: string; value: string }[];
}

interface VaultItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: VaultItemData | null;
  // Plaintext values for `item`'s fields — the parent must reveal() before
  // opening the dialog for edit, since list/detail reads are always masked.
  revealedFields?: VaultFieldData[] | null;
  categories: string[];
  onSubmit: (id: string | undefined, data: VaultItemSubmitData) => Promise<void>;
}

function formFromItem(item?: VaultItemData | null, revealedFields?: VaultFieldData[] | null): VaultForm {
  if (!item) return emptyForm;
  const source = revealedFields ?? item.fields;
  return {
    id: item.id,
    title: item.title,
    category: item.category,
    description: item.description || '',
    tags: item.tags.join(', '),
    favorite: item.favorite,
    expiresAt: item.expiresAt ? item.expiresAt.slice(0, 10) : '',
    fields: source.length > 0
      ? source.map((f) => ({ label: f.label, type: f.type, value: f.value ?? '' }))
      : [{ label: '', type: 'password', value: '' }],
  };
}

export function VaultItemDialog({ open, onOpenChange, item, revealedFields, categories, onSubmit }: VaultItemDialogProps) {
  // Parent remounts this component (via `key`) whenever the dialog opens for a
  // different item, so lazy initial state — not an effect — is enough to sync.
  const [form, setForm] = useState<VaultForm>(() => formFromItem(item, revealedFields));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fieldRowErrors, setFieldRowErrors] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);

  const [envPasteOpen, setEnvPasteOpen] = useState(false);
  const [envPasteText, setEnvPasteText] = useState('');

  const updateField = (index: number, patch: Partial<FieldForm>) => {
    setForm((f) => ({ ...f, fields: f.fields.map((field, i) => (i === index ? { ...field, ...patch } : field)) }));
  };
  const addField = () => setForm((f) => ({ ...f, fields: [...f.fields, { label: '', type: 'password', value: '' }] }));
  const removeField = (index: number) => setForm((f) => ({ ...f, fields: f.fields.filter((_, i) => i !== index) }));

  // Expands a pasted "KEY=value" block into individual rows up front, rather
  // than deferring to submit time — every row is then a normal label+type+value
  // field indistinguishable from one added by hand, so re-opening this item for
  // edit later shows each variable's real key as its label, not a blank one.
  const parseEnvPaste = () => {
    const parsedRows: FieldForm[] = envPasteText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .flatMap((line) => {
        const eq = line.indexOf('=');
        if (eq === -1) return [];
        const key = line.slice(0, eq).trim();
        if (!key) return [];
        return [{ label: key, type: 'env', value: line.slice(eq + 1).trim() }];
      });
    if (parsedRows.length === 0) return;
    setForm((f) => ({
      ...f,
      // Drop the default blank starter row so pasting into a fresh form
      // doesn't leave a dangling empty field behind.
      fields: [...f.fields.filter((field) => field.label.trim() || field.value.trim()), ...parsedRows],
    }));
    setEnvPasteOpen(false);
    setEnvPasteText('');
  };

  const submit = async () => {
    const parsed = vaultItemSchema.safeParse({ title: form.title, category: form.category });
    const fieldErrors: Record<string, string> = {};
    if (!parsed.success) parsed.error.issues.forEach((i) => { fieldErrors[i.path[0] as string] = i.message; });

    const rowErrors: Record<number, string> = {};
    form.fields.forEach((f, i) => {
      if (f.type === 'json' && f.value.trim()) {
        try {
          JSON.parse(f.value);
        } catch {
          rowErrors[i] = 'Invalid JSON';
        }
      }
    });

    const validFields = form.fields.filter((f) => f.label.trim());
    if (validFields.length === 0) fieldErrors.fields = 'At least one field is required';

    if (Object.keys(fieldErrors).length > 0 || Object.keys(rowErrors).length > 0) {
      setErrors(fieldErrors);
      setFieldRowErrors(rowErrors);
      return;
    }
    setFieldRowErrors({});

    setSaving(true);
    try {
      await onSubmit(form.id, {
        title: form.title,
        category: form.category,
        description: form.description || null,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        favorite: form.favorite,
        expiresAt: form.expiresAt || null,
        fields: validFields.map((f) => ({ label: f.label.trim(), type: f.type, value: f.value })),
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={item ? 'Edit Secret' : 'Add Secret'}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title *" error={errors.title}>
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Stripe — Production" />
        </Field>
        <Field label="Category *" error={errors.category}>
          <Input
            list="vault-categories"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            placeholder="API"
          />
          <datalist id="vault-categories">
            {categories.map((c) => <option key={c} value={c} />)}
          </datalist>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tags" hint="comma-separated">
          <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="stripe, production" />
        </Field>
        <Field label="Expires">
          <Input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
        </Field>
      </div>

      <Field label="Description">
        <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What this is for…" />
      </Field>

      <label className="flex items-center gap-2">
        <Switch checked={form.favorite} onCheckedChange={(v) => setForm({ ...form, favorite: v })} />
        <span className="text-xs font-medium text-foreground">Favorite</span>
      </label>

      <div className="space-y-3 border-t border-border pt-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-foreground">Fields</p>
          <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" size="sm" onClick={() => setEnvPasteOpen((v) => !v)}>
              Paste .env
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={addField}>
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Add field
            </Button>
          </div>
        </div>

        {envPasteOpen && (
          <div className="space-y-2 rounded-lg border border-dashed border-border p-3">
            <Textarea
              rows={4}
              value={envPasteText}
              onChange={(e) => setEnvPasteText(e.target.value)}
              placeholder={'DATABASE_URL=postgres://…\nBETTER_AUTH_SECRET=…'}
              className="font-mono text-xs"
            />
            <div className="flex items-center gap-2">
              <Button type="button" size="sm" onClick={parseEnvPaste} disabled={!envPasteText.trim()}>
                Add {envPasteText.split('\n').filter((l) => l.includes('=')).length || ''} field(s)
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => { setEnvPasteOpen(false); setEnvPasteText(''); }}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {errors.fields && <p className="text-xs text-destructive">{errors.fields}</p>}
        <div className="space-y-3">
          {form.fields.map((field, i) => (
            <div key={i} className="space-y-2 rounded-lg border border-border p-3">
              <div className="flex items-center gap-2">
                <Input
                  value={field.label}
                  onChange={(e) => updateField(i, { label: e.target.value })}
                  placeholder="Label, e.g. API Key"
                  className="flex-1"
                />
                <Select value={field.type} onValueChange={(v) => updateField(i, { type: v })}>
                  <SelectTrigger className="w-[150px] shrink-0"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {VAULT_FIELD_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FieldGenerator type={field.type} onGenerate={(value) => updateField(i, { value })} />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 shrink-0 p-0"
                  onClick={() => removeField(i)}
                  disabled={form.fields.length === 1}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              {MULTILINE_TYPES.includes(field.type) ? (
                <Textarea
                  rows={3}
                  value={field.value}
                  onChange={(e) => updateField(i, { value: e.target.value })}
                  placeholder="Value"
                  className="font-mono text-xs"
                />
              ) : (
                <Input
                  type={field.type === 'password' ? 'password' : 'text'}
                  value={field.value}
                  onChange={(e) => updateField(i, { value: e.target.value })}
                  placeholder="Value"
                />
              )}
              {fieldRowErrors[i] && <p className="text-xs text-destructive">{fieldRowErrors[i]}</p>}
            </div>
          ))}
        </div>
      </div>
    </FormDialog>
  );
}

const SECRET_KINDS: { value: SecretKind; label: string }[] = [
  { value: 'hex', label: 'Random Hex' },
  { value: 'uuid', label: 'UUID' },
  { value: 'nanoid', label: 'NanoID' },
  { value: 'jwt-signing-key', label: 'JWT Signing Key' },
];

// Password fields get the full length/character-set generator; every other
// type gets the lighter-weight "insert a random secret" picker instead.
function FieldGenerator({ type, onGenerate }: { type: string; onGenerate: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const [length, setLength] = useState(20);
  const [symbols, setSymbols] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [uppercase, setUppercase] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(true);
  const [secretKind, setSecretKind] = useState<SecretKind>('hex');

  const isPassword = type === 'password';

  const handleGenerate = () => {
    const value = isPassword
      ? generatePassword({ length, symbols, numbers, uppercase, excludeAmbiguous })
      : generateSecret(secretKind);
    onGenerate(value);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className="h-8 w-8 shrink-0 p-0" title="Generate">
          <Dices className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="space-y-3">
        {isPassword ? (
          <>
            <div className="flex items-center justify-between text-xs font-medium text-foreground">
              <span>Length</span>
              <span>{length}</span>
            </div>
            <input
              type="range"
              min={8}
              max={64}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="space-y-2">
              <label className="flex items-center justify-between text-xs text-foreground">
                <span>Uppercase</span>
                <Switch checked={uppercase} onCheckedChange={setUppercase} />
              </label>
              <label className="flex items-center justify-between text-xs text-foreground">
                <span>Numbers</span>
                <Switch checked={numbers} onCheckedChange={setNumbers} />
              </label>
              <label className="flex items-center justify-between text-xs text-foreground">
                <span>Symbols</span>
                <Switch checked={symbols} onCheckedChange={setSymbols} />
              </label>
              <label className="flex items-center justify-between text-xs text-foreground">
                <span>Exclude ambiguous (0/O/1/l/I)</span>
                <Switch checked={excludeAmbiguous} onCheckedChange={setExcludeAmbiguous} />
              </label>
            </div>
          </>
        ) : (
          <Select value={secretKind} onValueChange={(v) => setSecretKind(v as SecretKind)}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {SECRET_KINDS.map((k) => <SelectItem key={k.value} value={k.value}>{k.label}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        <Button type="button" size="sm" className="w-full" onClick={handleGenerate}>
          Generate
        </Button>
      </PopoverContent>
    </Popover>
  );
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-foreground">
        {label}
        {hint && <span className="ml-1.5 font-normal text-muted-foreground">— {hint}</span>}
      </span>
      {children}
      {error && <span className="block text-xs text-destructive">{error}</span>}
    </label>
  );
}
