"use client"
import { WebSocketProvider } from '@/components/WebSocketContext';
import { Box } from '@mui/joy';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {

    return (
        <html lang="en">
            <head>
                <meta name="viewport" content="initial-scale=1, width=device-width" />
                <title>Not Letter</title>
            </head>
            <body style={{ margin: 0 }}>
                <header></header>
                <main>
                    <WebSocketProvider>
                        <Box sx={{ display: 'flex', minHeight: '100dvh' }}>
                            {children}
                        </Box>
                    </WebSocketProvider>
                </main>
            </body>
        </html>
    )
}