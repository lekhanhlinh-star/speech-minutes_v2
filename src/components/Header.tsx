"use client"

import {
  Box,
  Flex,
  Spacer,
  Button,
  Image,
  IconButton,
  Drawer,
  Portal,
  CloseButton,
  VStack,
  HStack,
  Text,
  // useBreakpointValue,
} from "@chakra-ui/react"
// import { LuSun, LuMoon } from "react-icons/lu"
import { FiLogOut, FiMenu } from "react-icons/fi"
import { useColorMode } from "@/components/ui/color-mode"
import { useState, useMemo, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import logo from "@/assets/image.png"

export function Header() {
  const { colorMode } = useColorMode()
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const token = useMemo(() => localStorage.getItem("token"), [])
  // const isMobile = useBreakpointValue({ base: true, md: false })

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

  return (
    <Box
      as="header"
      px={{ base: 3, md: 6 }}
      py={2.5}
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex="1000"
      bg={
        colorMode === "light"
          ? "rgba(255,255,255,0.65)"
          : "rgba(35,35,42,0.65)"
      }
      boxShadow="0 8px 32px rgba(31,38,135,0.10)"
      borderBottom="1.5px solid rgba(220,220,230,0.35)"
      style={{
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
      }}
    >
      <Flex align="center" justify="space-between" maxW="1280px" mx="auto">
        {/* Logo */}
        <Box
          onClick={() => handleNavigate("/")}
          boxSize={{ base: "52px", md: "65px" }}
          borderRadius="full"
          bg={
            colorMode === "light"
              ? "rgba(255,255,255,0.55)"
              : "rgba(35,35,42,0.55)"
          }
          boxShadow="0 4px 16px rgba(180,180,200,0.13)"
          border="1.5px solid rgba(220,220,230,0.25)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          cursor="pointer"
          transition="box-shadow 0.18s"
          _hover={{
            boxShadow: "0 2px 16px #7c6ee633, 0 1.5px 8px #7c6ee611",
          }}
        >
          <Image
            src={logo}
            alt="Logo"
            boxSize={{ base: "42px", md: "54px" }}
            borderRadius="full"
            objectFit="cover"
            style={{ filter: "drop-shadow(0 2px 8px #fff8)" }}
          />
        </Box>

        {/* Center Nav (only desktop) */}
        <Flex
          align="center"
          gap={6}
          flex={1}
          justify="center"
          display={{ base: "none", md: "flex" }}
        >
        
        </Flex>

        {/* Right Section */}
        <HStack gap={{ base: 1, md: 3 }}>
          {/* Color mode toggle */}
          {/* <IconButton
            aria-label="Toggle color mode"
            onClick={toggleColorMode}
            variant="ghost"
            size={isMobile ? "sm" : "md"}
            bg="rgba(255,255,255,0.32)"
            borderRadius={16}
            boxShadow="0 2px 8px rgba(180,180,200,0.10)"
            style={{ backdropFilter: "blur(8px)" }}
            _hover={{ bg: "rgba(124,110,230,0.10)" }}
          
          >
            {colorMode === "light" ? <LuMoon /> : <LuSun />}
          </IconButton> */}

          {/* Logout (only if logged in) */}
          {token && (
            <Button
              colorScheme="purple"
              variant="outline"
              size="sm"
              // leftIcon={}
              onClick={handleLogout}
              display={{ base: "none", md: "inline-flex" }}
            >
              <FiLogOut />
              Logout
            </Button>
          )}

          {/* Mobile Menu Icon */}
          <IconButton
            aria-label="Open menu"
            onClick={() => setIsOpen(true)}
            variant="ghost"
            size="md"
            display={{ base: "flex", md: "none" }}
            bg="rgba(255,255,255,0.32)"
            borderRadius={16}
            boxShadow="0 2px 8px rgba(180,180,200,0.10)"
            style={{ backdropFilter: "blur(8px)" }}
            _hover={{ bg: "rgba(124,110,230,0.10)" }}
          >
            <FiMenu />
          </IconButton>
        </HStack>
      </Flex>

      {/* Drawer (Mobile Menu) */}
  <Drawer.Root open={isOpen} onOpenChange={(e) => setIsOpen(e.open)} placement="end">
        <Portal>
          <Drawer.Backdrop
            style={{
              backdropFilter: "blur(8px)",
              background: "rgba(31,38,135,0.10)",
            }}
          />
          <Drawer.Positioner style={{ right: 0, left: 'auto', top: 0, bottom: 0, position: 'fixed', maxWidth: '90vw', width: 340, zIndex: 1400 }}>
            <Drawer.Content
              bg={
                colorMode === "light"
                  ? "rgba(255,255,255,0.88)"
                  : "rgba(35,35,42,0.95)"
              }
              borderRadius="2xl"
              border="1.5px solid rgba(220,220,230,0.25)"
              boxShadow="0 8px 32px rgba(31,38,135,0.18)"
              style={{
                backdropFilter: "blur(18px)",
                WebkitBackdropFilter: "blur(18px)",
                height: '100vh',
                maxWidth: 340,
                width: '100%',
                position: 'fixed',
                right: 0,
                top: 0,
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
              }}
            >
              <Drawer.Header>
                <Text
                  fontWeight="700"
                  fontSize="22px"
                  color="#7c6ee6"
                  letterSpacing={0.5}
                >
                  Menu
                </Text>
              </Drawer.Header>

              <Drawer.Body>
                <VStack align="stretch" gap={3}>
                
                </VStack>
              </Drawer.Body>

              <Drawer.Footer justifyContent="space-between">
                <HStack>
                  <Spacer />
                  {/* <Text fontSize="sm" fontWeight="medium">
                    {colorMode === "light" ? "Light Mode" : "Dark Mode"}
                  </Text>
                  <IconButton
                    aria-label="Toggle color mode"
                    onClick={toggleColorMode}
                    variant="ghost"
                    size="sm"
                    bg="rgba(255,255,255,0.32)"
                    borderRadius={12}
                    boxShadow="0 2px 8px rgba(180,180,200,0.10)"
                    _hover={{ bg: "rgba(124,110,230,0.10)" }}
                    // icon={colorMode === "light" ? <LuMoon /> : <LuSun />}
                  >
                    {colorMode === "light" ? <LuMoon /> : <LuSun />}
                  </IconButton> */}

                    {token && (
                    <IconButton
                      // leftIcon={<FiLogOut />}
                      // colorScheme="purple"
                      color={"#000"}
                      bg="rgba(255,255,255,0.32)"
                      borderRadius={14}
                      w="100%"
                      onClick={() => {
                        handleLogout()
                        setIsOpen(false)
                      }}
                    boxShadow="0 2px 8px rgba(180,180,200,0.10)"

                    >
                      <FiLogOut />
                      Logout
                    </IconButton>
                  )}
                </HStack>

                <Drawer.CloseTrigger asChild>
                  <CloseButton size="sm" />
                </Drawer.CloseTrigger>
              </Drawer.Footer>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
    </Box>
  )
}
  