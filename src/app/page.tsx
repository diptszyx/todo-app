'use client'

import { useState, useMemo, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import TodoItem from './components/TodoItem';
import { createProgram, findTaskPDA } from './utils/program';
import { PublicKey } from '@solana/web3.js';
import { toast } from 'react-toastify';
import { BN } from '@coral-xyz/anchor';
import { SystemProgram } from '@solana/web3.js';

interface Todo {
  publicKey: PublicKey;
  account: {
    authority: PublicKey;
    content: string;
    marked: boolean;
  };
}

export default function Home() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(false);

  const program = useMemo(() => {
    if (connection && wallet) {
      return createProgram(connection, wallet);
    }
  }, [connection, wallet]);

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!program || !wallet.publicKey || !newTask.trim()) return;
    
    try {
      setLoading(true);
      
      const [taskPDA] = findTaskPDA(
        wallet.publicKey,
        newTask,
        program.programId
      );

      const existingAccount = await connection.getAccountInfo(taskPDA);
      
      if (existingAccount) {
        toast.error('This task already exists!');
        return;
      }

      console.log("Adding task with PDA:", taskPDA.toString());

      const tx = await program.methods
        .addTask(newTask)
        .accounts({
          taskAccount: taskPDA,
          authority: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      await connection.confirmTransaction(tx, 'confirmed');
      
      await fetchTodos();
      setNewTask('');
      toast.success('Task added successfully!');
    } catch (error) {
      console.error("Error details:", error);
      toast.error('Failed to add task');
    } finally {
      setLoading(false);
    }
  };

  const deleteTodo = async (todo: Todo) => {
    if (!program || !wallet.publicKey) return;

    try {
      setLoading(true);
      await program.methods
        .removeTask()
        .accounts({
          taskAccount: todo.publicKey,
          authority: wallet.publicKey,
        })
        .rpc();

      await fetchTodos();
      toast.success('Task deleted successfully!');
    } catch (error) {
      console.error("Error deleting todo:", error);
      toast.error('Failed to delete task');
    } finally {
      setLoading(false);
    }
  };

  const toggleTodo = async (todo: Todo) => {
    if (!program || !wallet.publicKey) return;

    try {
      setLoading(true);
      await program.methods
        .markTask()
        .accounts({
          taskAccount: todo.publicKey,
          authority: wallet.publicKey,
        })
        .rpc();

      await fetchTodos();
      toast.success('Task status updated!');
    } catch (error) {
      console.error("Error toggling todo:", error);
      toast.error('Failed to update task status');
    } finally {
      setLoading(false);
    }
  };

  const fetchTodos = async () => {
    if (!program || !wallet.publicKey) return;

    try {
      const accounts = await connection.getProgramAccounts(program.programId);
      
      // Log raw data để debug
      accounts.forEach(acc => {
        console.log("Account:", {
          pubkey: acc.pubkey.toString(),
          data: Array.from(acc.account.data),
          owner: acc.account.owner.toString()
        });
      });

      // Parse với type safety
      const parsedTodos = accounts
        .filter(acc => acc.account.data.length >= 8)
        .map(({ pubkey, account }): Todo | null => {
          const data = account.data;
          try {
            const authority = new PublicKey(data.slice(8, 40));
            const contentLength = data.slice(40, 44).readUInt32LE(0);
            const content = new TextDecoder().decode(data.slice(44, 44 + contentLength));
            const marked = Boolean(data[44 + contentLength]);

            const todo: Todo = {
              publicKey: pubkey,
              account: {
                authority,
                content,
                marked,
              }
            };
            return todo;
          } catch (e) {
            console.error("Error parsing account:", e);
            return null;
          }
        })
        .filter((todo): todo is Todo => todo !== null); // Type guard

      console.log("Parsed todos:", parsedTodos);
      setTodos(parsedTodos);
    } catch (error) {
      console.error("Error fetching todos:", error);
      toast.error('Failed to load tasks');
    }
  };

  useEffect(() => {
    if (program && wallet.publicKey) {
      fetchTodos();
    }
  }, [program, wallet.publicKey]);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Solana Todo App</h1>
          <WalletMultiButton />
        </div>

        {wallet.connected ? (
          <>
            <form onSubmit={addTodo} className="mb-8">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="Add a new task..."
                  className="flex-1 p-2 border rounded-lg dark:bg-gray-800"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Add Task
                </button>
              </div>
            </form>

            <div className="space-y-4">
              {loading ? (
                <div>Loading tasks...</div>
              ) : todos.length === 0 ? (
                <div>No tasks found</div>
              ) : (
                todos.map((todo) => (
                  <TodoItem
                    key={todo.publicKey.toString()}
                    task={todo.account.content}
                    completed={todo.account.marked}
                    onDelete={() => deleteTodo(todo)}
                    onToggle={() => toggleTodo(todo)}
                    loading={loading}
                  />
                ))
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <h2 className="text-xl mb-4">Please connect your wallet to use the Todo App</h2>
            <p className="text-gray-500">Connect using the button above to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
