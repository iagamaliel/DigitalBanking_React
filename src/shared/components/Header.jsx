import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Flex,
  HStack,
  Text,
  Button,
} from "@chakra-ui/react";
import {
  FiHome,
  FiRepeat,
  FiLogOut,
  FiUser,
} from "react-icons/fi";

import { useAuth } from "../../features/auth/context/AuthContext.jsx";

export function Header() {
  const navigate = useNavigate();
  const { logoutUser, user } = useAuth();

  const handleLogout = () => {
    logoutUser();
    navigate("/", { replace: true });
  };

const storedData = JSON.parse(
  sessionStorage.getItem("userData") || "null"
);

const userName =
  user?.username ||
  storedData?.data?.username ||
  storedData?.username ||
  "Usuario";

  return (
    <Box
      as="header"
      bg="white"
      borderBottom="1px solid"
      borderColor="gray.200"
      px={{ base: 4, md: 8 }}
      py={4}
      shadow="sm"
    >
      <Flex
        maxW="1200px"
        mx="auto"
        align="center"
        justify="space-between"
        wrap="wrap"
        gap={4}
      >
        <Link to="/dashboard">
          <Text
            fontSize="xl"
            fontWeight="bold"
            color="blue.600"
          >
            Digital Banking
          </Text>
        </Link>

        <HStack gap={3}>
          <Button
            asChild
            variant="ghost"
            colorPalette="blue"
          >
            <Link to="/dashboard">
              <FiHome />
              Inicio
            </Link>
          </Button>

          <Button
            asChild
            variant="ghost"
            colorPalette="blue"
          >
            <Link to="/transfer">
              <FiRepeat />
              Transferir fondos
            </Link>
          </Button>
        </HStack>

        <HStack gap={3}>
          <HStack gap={2}>
            <FiUser color="#3182CE" />
            <Text
              fontWeight="medium"
              color="gray.700"
            >
              Hola, {userName}
            </Text>
          </HStack>

          <Button
            colorPalette="red"
            variant="outline"
            onClick={handleLogout}
          >
            <FiLogOut />
            Cerrar sesión
          </Button>
        </HStack>
      </Flex>
    </Box>
  );
}

export default Header;
