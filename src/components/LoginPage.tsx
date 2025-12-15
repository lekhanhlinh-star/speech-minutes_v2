
import React, { useState } from "react";
import { login } from "../api";
import { Box, Input, Button, Heading, Text, Flex } from "@chakra-ui/react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
// import { LuLock } from "react-icons/lu";
import logo from "@/assets/image.png";

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("");
    if (!username || !password) {
      setError("Please enter both username and password.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await login(username, password);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.detail || "Login failed.");
      } else {
        const data = await res.json();
        setSuccess("Login successful.");
        setUsername("");
        setPassword("");
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
        navigate("/record", { replace: true });
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
        maxW="400px"
        w="100%"
        p={10}
        borderRadius={24}
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
          Welcome Back
        </Heading>
        <Text mb={7} color="#888" fontSize={16}>
          Please login to your account
        </Text>
        <form onSubmit={handleLogin} style={{ width: '100%' }}>
          <Box mb={4}>
            <Input
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              color={"#000000ff"}
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
              value={password}
              onChange={e => setPassword(e.target.value)}
              size="lg"
              borderRadius={14}
              bg="#f7f6ff"
              color={"#000000ff"}

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
            colorScheme="purple"
            w="100%"
            size="lg"
            borderRadius={14}
            fontWeight={700}
            fontSize={18}
            loading={loading}
            bg="#7c6ee6"
            mt={2}
            boxShadow="0 2px 12px #7c6ee633"
            _hover={{ bg: '#7c6ee6', color: '#fff' }}
          >
            Login
          </Button>
          <RouterLink to="/signup" style={{ textDecoration: 'none', width: '100%' }}>
            <Button
              variant="outline"
              colorScheme="purple"
              w="100%"
              size="lg"
              borderRadius={14}
              fontWeight={700}
              fontSize={18}
              mt={3}
              boxShadow="0 2px 12px #7c6ee611"
               bg= {'#f7f6ff'}
                color= {'#7c6ee6'} borderColor= {'#7c6ee6'}
              _hover={{ bg: '#f7f6ff', color: '#7c6ee6', borderColor: '#7c6ee6' }}
            >
              Register
            </Button>
          </RouterLink>
        </form>
      </Box>
    </Flex>
  );
}
