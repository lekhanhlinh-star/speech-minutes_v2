"use client"

import {
  Box,
  Flex,
  Button,
  Image,
  IconButton,
  Drawer,
  Portal,
  CloseButton,
  VStack,
  HStack,
  Text,
  useBreakpointValue,
  Input,
  InputGroup,
} from "@chakra-ui/react"
import { FiLogOut, FiHome, FiCalendar, FiUpload, FiMoreHorizontal, FiMic } from "react-icons/fi"
import { useColorMode, useColorModeValue } from "@/components/ui/color-mode"
import { useState, useMemo, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import logo from "@/assets/image.png" // Đảm bảo logo của bạn có thể hiển thị tốt

// Danh sách các mục điều hướng trong sidebar
const SIDEBAR_ITEMS = [
  { name: "Home", path: "/", icon: FiHome },
  { name: "Record", path: "/record", icon: FiMic },
  // { name: "Meetings", path: "/meetings", icon: FiCalendar },
  { name: "Meeting Status", path: "/meeting-status", icon: FiCalendar }, // Có thể dùng icon khác nếu cần
  { name: "Uploads", path: "/uploads", icon: FiUpload },
  // { name: "Integrations", path: "/integrations", icon: FiPlusCircle },
  // { name: "Analytics", path: "/analytics", icon: FiStar },
  // { name: "AI Apps", path: "/ai-apps", icon: FiStar },
  // { name: "Team", path: "/team", icon: FiUsers },
  // { name: "Upgrade", path: "/upgrade", icon: FiStar },
  // { name: "Settings", path: "/settings", icon: FiSettings },
  // { name: "More", path: "/more", icon: FiMoreHorizontal },
]

export function Header() {
  const { colorMode } = useColorMode()
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const token = useMemo(() => localStorage.getItem("token"), [])
  const showSidebar = useBreakpointValue({ base: false, md: true })

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token")
    navigate("/login", { replace: true })
  }, [navigate])

  const handleNavigate = useCallback(
    (path: string) => {
      navigate(path)
      setIsOpen(false)
    },
    [navigate]
  )

  // Màu nền cho sidebar và header dựa trên chế độ màu
  // Chakra v3: use fallback colors
  const sidebarBg = colorMode === "light" ? "white" : "gray.800"
  const headerBg = colorMode === "light" ? "white" : "gray.800"
  const borderColor = colorMode === "light" ? "gray.200" : "gray.700"
  const textColor = colorMode === "light" ? "gray.600" : "gray.300"
  const activeBg = colorMode === "light" ? "purple.50" : "purple.900"
  const activeText = colorMode === "light" ? "purple.500" : "purple.300"

  return (
    <Box as="header" position="relative">
      {/* Sidebar - Ẩn trên mobile */}
      {showSidebar && (
        <Box
          position="fixed"
          left={0}
          top="0"
          width="220px" // Chiều rộng tương tự Fireflies.ai
          height="100vh"
          zIndex="900"
          bg={sidebarBg}
          borderRight={`1px solid ${borderColor}`}
          boxShadow="0 4px 12px rgba(0,0,0,0.05)"
          display="flex"
          flexDirection="column"
          pt={4}
          pb={4}
        >
          {/* Logo */}
          <Flex align="center" px={6} mb={6}>
            <Image src={logo} alt="Logo" boxSize="28px" mr={3} />
            <Text fontWeight="bold" fontSize="lg">voicemo.ai</Text>
          </Flex>

          {/* Danh sách menu */}
          <VStack align="stretch" gap={1} flex={1} px={4}>
            {SIDEBAR_ITEMS.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Button
                  key={item.path}
                  variant="ghost"
                  justifyContent="flex-start"
                  onClick={() => handleNavigate(item.path)}
                  color={isActive ? activeText : textColor}
                  bg={isActive ? activeBg : "transparent"}
                  borderRadius="md"
                  py={3}
                  px={4}
                  fontSize="sm"
                  fontWeight={isActive ? "medium" : "normal"}
                >
                  <item.icon style={{ marginRight: 8 }} />
                  {item.name}
                </Button>
              )
            })}
          </VStack>

          {/* Nút Logout */}
          {token && (
            <Box px={4} mt={4}>
              <Button
                w="100%"
                variant="ghost"
                colorScheme="red"
                onClick={handleLogout}
                justifyContent="flex-start"
                color={textColor}
                borderRadius="md"
                py={3}
                px={4}
                fontSize="sm"
              >
                <FiLogOut style={{ marginRight: 8 }} />
                Logout
              </Button>
            </Box>
          )}
        </Box>
      )}

      {/* Header chính */}
      <Box
        px={{ base: 3, md: 6 }}
        py={2.5}
        position="fixed"
        top={0}
        left={showSidebar ? "220px" : 0}
        right={0}
        zIndex="1000"
        bg={headerBg}
        borderBottom={`1px solid ${borderColor}`}
        boxShadow="0 2px 4px rgba(0,0,0,0.05)"
      >
        <Flex align="center" justify="space-between" maxW="1280px" mx="auto">
          {/* Hamburger menu for mobile */}
          {!showSidebar && (
            <IconButton
              aria-label="Open menu"
              variant="ghost"
              size="md"
              onClick={() => setIsOpen(true)}
              display={{ base: "flex", md: "none" }}
              mr={2}
            >
              <FiMoreHorizontal />
            </IconButton>
          )}
          {/* Tiêu đề trang hiện tại (ẩn ở mobile) */}
          <Text
            fontWeight="medium"
            fontSize="sm"
            display={{ base: 'none', md: 'block' }}
          >
            {(() => {
              const current = SIDEBAR_ITEMS.find(item => item.path === location.pathname)
              return current ? current.name : ""
            })()}
          </Text>

          {/* Thanh tìm kiếm */}
          <InputGroup maxW="400px">
            <Input
              placeholder="Search by title or keyword"
              variant="outline"
              size="sm"
              borderRadius="full"
            display={{ base: 'none', md: 'block' }}

            />
            {/* Icon can be placed absolutely if needed */}
          </InputGroup>

          {/* Các nút hành động */}
          <HStack gap={2}>
            {/* ...existing code... */}
            <Box
              bg="blue.500"
              color="white"
              borderRadius="full"
              boxSize="32px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontWeight="bold"
              fontSize="sm"
            >
              L {/* Hoặc avatar hình ảnh */}
            </Box>
          </HStack>
        </Flex>
      </Box>

      {/* Drawer (Mobile Menu) */}
      <Drawer.Root open={isOpen} onOpenChange={(e) => setIsOpen(e.open)} placement="end">
        <Portal>
          <Drawer.Backdrop
            style={{
              backdropFilter: "blur(4px)",
              background: "rgba(0, 0, 0, 0.25)",
            }}
          />
          <Drawer.Positioner style={{ right: 0, left: 'auto', top: 0, bottom: 0, position: 'fixed', maxWidth: '90vw', width: 280, zIndex: 1400 }}>
            <Drawer.Content
              bg={useColorModeValue("white", "gray.800")}
              borderRadius="xl"
              border={`1px solid ${borderColor}`}
              boxShadow="0 8px 24px rgba(0,0,0,0.1)"
              style={{
                height: '100vh',
                maxWidth: 280,
                width: '100%',
                position: 'fixed',
                right: 0,
                top: 0,
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
              }}
            >
              <Drawer.Header pb={2}>
                <Text fontWeight="bold" fontSize="lg">Menu</Text>
              </Drawer.Header>

              <Drawer.Body pt={4}>
                <VStack align="stretch" gap={1}>
                  {SIDEBAR_ITEMS.map((item) => {
                    const isActive = location.pathname === item.path
                    return (
                      <Button
                        key={item.path}
                        variant="ghost"
                        justifyContent="flex-start"
                        onClick={() => handleNavigate(item.path)}
                        color={isActive ? activeText : textColor}
                        bg={isActive ? activeBg : "transparent"}
                        borderRadius="md"
                        py={3}
                        px={4}
                        fontSize="sm"
                        fontWeight={isActive ? "medium" : "normal"}
                      >
                        <item.icon style={{ marginRight: 8 }} />
                        {item.name}
                      </Button>
                    )
                  })}
                </VStack>
              </Drawer.Body>

              <Drawer.Footer pt={2} pb={4}>
                <HStack width="100%" gap={3}>
                  {token && (
                    <Button
                      flex={1}
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => {
                        handleLogout()
                        setIsOpen(false)
                      }}
                    >
                      <FiLogOut style={{ marginRight: 8 }} />
                      Logout
                    </Button>
                  )}
                  <Drawer.CloseTrigger asChild>
                    <IconButton
                      variant="ghost"
                      colorScheme="gray"
                      aria-label="Close menu"
                    >
                      <CloseButton size="sm" />
                    </IconButton>
                  </Drawer.CloseTrigger>
                </HStack>
              </Drawer.Footer>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
    </Box>
  )
}