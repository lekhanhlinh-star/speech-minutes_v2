import React, { useState } from "react";
import { registerUser } from "../api";
import { Box, Input, Button, Heading, Text, Flex } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import logo from "@/assets/image.png";

export default function SignUpPage({ onSignUp }: { onSignUp?: (username: string) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("");
    if (!username || !password || !confirmPassword) {
      setError("Please fill all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await registerUser(username, password);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.detail || "Registration failed.");
      } else {
        setSuccess("Registration successful! You can now log in.");
        setUsername("");
        setPassword("");
        setConfirmPassword("");
        if (onSignUp) onSignUp(username);
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bgGradient="linear(120deg, #f7f6ff 0%, #e9e6fa 100%)">
      <Box
        maxW="480px"
        w="100%"
        minW={{ base: "90vw", sm: "400px", md: "420px" }}
        p={{ base: 6, md: 12 }}
        borderRadius={28}
        boxShadow="0 8px 32px 0 #7c6ee644, 0 1.5px 8px 0 #b4b4c81a"
        bg="#fff"
        display="flex"
        flexDir="column"
        alignItems="center"
      >
        <Box mb={6}>
          <img src={logo} alt="Logo" style={{ width: 64, height: 64, borderRadius: 16, boxShadow: '0 2px 12px #7c6ee655' }} />
        </Box>
        <Heading mb={2} size="lg" color="#7c6ee6" fontWeight={800} letterSpacing={1}>
          Create Account
        </Heading>
        <Text mb={7} color="#888" fontSize={16}>
          Sign up to get started
        </Text>
        <form onSubmit={handleSignUp} style={{ width: '100%' }}>
          <Box mb={4}>
            <Input
              placeholder="Username"
              color={"#000000ff"}
              value={username}
              onChange={e => setUsername(e.target.value)}
              size="lg"
              borderRadius={14}
              bg="#f7f6ff"
              boxShadow="0 1.5px 8px 0 #b4b4c80a"
              border="1.5px solid #ece9fa"
              fontSize={17}
              _focus={{ borderColor: '#7c6ee6', boxShadow: '0 0 0 2px #7c6ee633' }}
            />
          </Box>
          <Box mb={2}>
            <Input
              placeholder="Password"
              type="password"
              color={"#000000ff"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              size="lg"
              borderRadius={14}
              bg="#f7f6ff"
              boxShadow="0 1.5px 8px 0 #b4b4c80a"
              border="1.5px solid #ece9fa"
              fontSize={17}
              _focus={{ borderColor: '#7c6ee6', boxShadow: '0 0 0 2px #7c6ee633' }}
            />
          </Box>
          <Box mb={2}>
            <Input
              placeholder="Confirm Password"
              type="password"
              color={"#000000ff"}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              size="lg"
              borderRadius={14}
              bg="#f7f6ff"
              boxShadow="0 1.5px 8px 0 #b4b4c80a"
              border="1.5px solid #ece9fa"
              fontSize={17}
              _focus={{ borderColor: '#7c6ee6', boxShadow: '0 0 0 2px #7c6ee633' }}
            />
          </Box>
          {error && <Text color="red.500" mb={3} fontSize={15}>{error}</Text>}
          {success && <Text color="green.500" mb={3} fontSize={15}>{success}</Text>}
          <Button
            type="submit"
            w="100%"
            size="lg"
            borderRadius={16}
            fontWeight={800}
            fontSize={19}
            loading={loading}
            mt={2}
            bg="#7c6ee6"
            color="#fff"
            boxShadow="0 4px 16px #7c6ee633, 0 1.5px 8px 0 #b4b4c81a"
            letterSpacing={1}
            transition="all 0.18s"
            _hover={{ bg: '#5a4ee6', boxShadow: '0 6px 24px #7c6ee655' }}
          >
            Sign Up
          </Button>
          <RouterLink to="/login" style={{ textDecoration: 'none', width: '100%' }}>
            <Button
              variant="outline"
              colorScheme="purple"
              w="100%"
              size="lg"
              borderRadius={16}
              fontWeight={800}
              fontSize={19}
              mt={3}
              boxShadow="0 2px 12px #7c6ee611"
              bg="#fff"
              color="#7c6ee6"
              borderColor="#7c6ee6"
              _hover={{ bg: '#f7f6ff', color: '#5a4ee6', borderColor: '#5a4ee6' }}
            >
              Log in
            </Button>
          </RouterLink>
        </form>
      </Box>
    </Flex>
  );
}
