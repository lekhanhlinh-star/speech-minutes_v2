import { Box } from '@chakra-ui/react';
import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  maxW?: string;
  bg?: string;
  fullWidth?: boolean;
}

export function Layout({ 
  children, 
  maxW = "1200px", 
  bg = "gray.50",
  fullWidth = false 
}: LayoutProps) {
  if (fullWidth) {
    // Full width layout - handle sidebar spacing per section
    return (
      <Box
        minH="100vh"
        bg={bg}
        w="100%"
        pt="80px" // Padding top để tránh fixed header
      >
        {children}
      </Box>
    );
  }

  // Regular constrained layout
  return (
    <Box
      minH="100vh"
      bg={bg}
      w="100%"
      ml={{ base: 0, md: "220px" }} // Sidebar margin
      pt="80px" // Padding top để tránh fixed header
      transition="margin 0.3s ease"
    >
      <Box
        maxW={maxW}
        mx="auto"
        px={6}
        py={6}
      >
        {children}
      </Box>
    </Box>
  );
}

// Hook để sử dụng layout properties
export function useLayout() {
  return {
    sidebarWidth: "220px",
    headerHeight: "80px",
  };
}