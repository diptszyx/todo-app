# Todo App with Next.js and Solana

This project combines a Next.js frontend with Solana smart contracts using Anchor framework.

## Frontend Setup

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Smart Contract Setup

### Creating Your Anchor Project

To integrate with Solana smart contracts, follow these steps:

1. **Initialize a new Anchor project**:
```bash
anchor init todoapp
cd todoapp
```

2. **Update Smart Contract Code**:
   - Replace the content in `programs/todoapp/src/lib.rs` with the provided smart contract code
   - Update the program ID in `declare_id!("YourNewProgramIDHere")`

3. **Build and Deploy**:
```bash
# Build the project
anchor build

# Get your program ID
solana address -k target/deploy/todoapp-keypair.json

# Deploy to devnet
anchor deploy --provider.cluster devnet
```

4. **Use the Generated IDL**:
   - Find the new IDL file at `target/idl/todoapp.json`
   - Copy this file to your frontend project
   - Update your frontend configuration with the new program ID

## Frontend Development

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font).

## Learn More

### Next.js Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
- [Next.js GitHub repository](https://github.com/vercel/next.js)

### Solana/Anchor Resources
- [Anchor Documentation](https://www.anchor-lang.com/)
- [Solana Documentation](https://docs.solana.com/)
- [Solana Cookbook](https://solanacookbook.com/)

## Deployment

### Frontend Deployment
The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

### Smart Contract Deployment
Make sure to:
1. Have sufficient SOL in your wallet for deployment
2. Be connected to the correct Solana network (devnet/mainnet)
3. Keep your program ID and IDL files updated in your frontend
