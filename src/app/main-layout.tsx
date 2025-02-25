import { Button } from '@/components/ui/button';

export default function MainLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background px-64">
      {/* Main Content */}
      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-14 border-b px-4 flex items-center justify-between">
            <h1 className="text-sm font-medium">Chat</h1>
            <div className="flex items-center gap-2">
              {/* <Button variant="ghost" size="sm">
                Save conversation
              </Button> */}
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                {/* <X className="h-4 w-4" /> */}
                <a
                  href="https://github.com/janice143/langchain-book-pal"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 2C6.75 2 2 6.75 2 12c0 4.25 2.97 7.81 7 8.75.51.09.7-.22.7-.49 0-.24-.01-.89-.01-1.75-2.44.45-2.95-.59-3.13-1.13-.1-.26-.53-1.13-.91-1.36-.31-.19-.75-.66-.01-.68.69-.02 1.19.64 1.36.9.8 1.34 2.09.96 2.6.73.08-.58.31-.96.57-1.18-1.99-.23-4.08-1-4.08-4.46 0-1 .36-1.82.91-2.47-.09-.23-.39-1.17.09-2.44 0 0 .77-.25 2.52.94.73-.2 1.51-.3 2.28-.3.77 0 1.55.1 2.28.3 1.75-1.19 2.52-.94 2.52-.94.48 1.27.18 2.21.09 2.44.56.65.91 1.47.91 2.47 0 3.47-2.1 4.23-4.1 4.46.32.28.61.83.61 1.68 0 1.22-.01 2.21-.01 2.51 0 .27.18.58.71.48A8.016 8.016 0 0012 2z"
                    />
                  </svg>
                </a>
              </Button>
            </div>
          </header>
          {children}
        </div>
      </div>
    </div>
  );
}
