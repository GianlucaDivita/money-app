import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Pencil, Trash2, Receipt } from 'lucide-react';
import type { Transaction, Category } from '../../types';
import { CategoryIcon } from '../shared/CategoryIcon';
import { CurrencyDisplay } from '../shared/CurrencyDisplay';
import { ReceiptViewer } from './ReceiptViewer';

interface TransactionRowProps {
  transaction: Transaction;
  category?: Category;
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
}

export function TransactionRow({ transaction, category, onEdit, onDelete }: TransactionRowProps) {
  const isIncome = transaction.type === 'income';
  const [showReceipt, setShowReceipt] = useState(false);

  return (
    <div className="flex items-center gap-4 py-4 px-4 rounded-xl hover:bg-[var(--surface-hover)] transition-colors group">
      {/* Category icon */}
      <CategoryIcon
        icon={category?.icon || 'circle-dot'}
        color={category?.color || '#888'}
        size="md"
      />

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-medium text-[var(--text-primary)] truncate">
          {transaction.description}
        </p>
        <p className="text-sm text-[var(--text-muted)] truncate mt-0.5">
          {category?.name || 'Uncategorized'}
          {transaction.merchant && ` · ${transaction.merchant}`}
          {transaction.splits?.length && (
            <span className="ml-1.5 inline-flex px-1.5 py-0.5 text-[10px] rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-medium">
              Split
            </span>
          )}
        </p>
      </div>

      {/* Amount & date */}
      <div className="text-right shrink-0">
        <CurrencyDisplay
          amount={isIncome ? transaction.amount : -transaction.amount}
          className={`text-[15px] font-semibold ${isIncome ? 'text-[var(--accent-income)]' : 'text-[var(--accent-expense)]'}`}
        />
        <p className="text-sm text-[var(--text-muted)] mt-0.5">
          {format(parseISO(transaction.date), 'MMM d')}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        {transaction.receiptImage && (
          <button
            onClick={() => setShowReceipt(true)}
            className="p-2 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--accent-primary)] transition-colors cursor-pointer"
            aria-label="View receipt"
          >
            <Receipt size={15} />
          </button>
        )}
        <button
          onClick={() => onEdit(transaction)}
          className="p-2 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors cursor-pointer"
          aria-label="Edit"
        >
          <Pencil size={15} />
        </button>
        <button
          onClick={() => onDelete(transaction.id)}
          className="p-2 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--accent-expense)] transition-colors cursor-pointer"
          aria-label="Delete"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {transaction.receiptImage && (
        <ReceiptViewer
          isOpen={showReceipt}
          onClose={() => setShowReceipt(false)}
          imageUrl={transaction.receiptImage}
        />
      )}
    </div>
  );
}
