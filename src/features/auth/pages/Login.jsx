
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Center,
  Container,
  VStack,
  Heading,
  Text,
  Field,
  Input,
  InputGroup,
  Button,
  Alert,
  Icon,
  Separator,
} from "@chakra-ui/react";
import {
  FiUser,
  FiLock,
  FiEye,
  FiEyeOff,
  FiShield,
} from "react-icons/fi";

import { login } from "../../../features/auth/services/authServices.js";
import { useAuth } from "../../../features/auth/context/AuthContext.jsx";

export function Login() {
  const [user, setUser] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { loginUser } = useAuth();

  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;

    setUser((previousUser) => ({
      ...previousUser,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const result = await login(
        user.username.trim(),
        user.password
      );

      if (!result?.succeeded) {
        setError(result?.message || "Credenciales incorrectas");
        return;
      }

      loginUser(result);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      minH="100vh"
      bg="gray.100"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={4}
      py={8}
    >
      <Container maxW="md" p={0}>
        <Box
          bg="white"
          borderRadius="2xl"
          boxShadow="xl"
          overflow="hidden"
        >
          {/* Encabezado */}
          <Box
            bg="blue.900"
            color="white"
            textAlign="center"
            py={8}
            px={6}
          >
            <Center mb={3}>
              <Box
                bg="whiteAlpha.200"
                p={3}
                borderRadius="xl"
              >
                <Icon as={FiShield} boxSize="32px" />
              </Box>
            </Center>

            <Heading size="lg" mb={2}>
              Digital Banking
            </Heading>

            <Text color="blue.100" fontSize="sm">
              Tu banca, siempre contigo
            </Text>
          </Box>

          {/* Formulario */}
          <Box p={{ base: 6, md: 8 }}>
            <VStack gap={6} align="stretch">
              <Box>
                <Heading size="lg" color="gray.800">
                  Bienvenido
                </Heading>

                <Text color="gray.500" mt={2} fontSize="sm">
                  Ingresa tus credenciales para continuar.
                </Text>
              </Box>

              {error && (
                <Alert.Root status="error" borderRadius="lg">
                  <Alert.Indicator />
                  <Alert.Content>
                    <Alert.Description>{error}</Alert.Description>
                  </Alert.Content>
                </Alert.Root>
              )}

              <form onSubmit={handleSubmit}>
                <VStack gap={5} align="stretch">
                  <Field.Root required>
                    <Field.Label color="gray.700">
                      Usuario
                      <Field.RequiredIndicator />
                    </Field.Label>

                    <InputGroup
                      startElement={
                        <Icon as={FiUser} color="gray.400" />
                      }
                    >
                      <Input
                        name="username"
                        value={user.username}
                        onChange={handleChange}
                        placeholder="Ingresa tu usuario"
                        autoComplete="username"
                        bg="gray.50"
                        borderRadius="lg"
                        focusRingColor="blue.500"
                      />
                    </InputGroup>
                  </Field.Root>

                  <Field.Root required>
                    <Field.Label color="gray.700">
                      Contraseña
                      <Field.RequiredIndicator />
                    </Field.Label>

                    <InputGroup
                      startElement={
                        <Icon as={FiLock} color="gray.400" />
                      }
                      endElement={
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          onClick={() =>
                            setShowPassword((previous) => !previous)
                          }
                          aria-label={
                            showPassword
                              ? "Ocultar contraseña"
                              : "Mostrar contraseña"
                          }
                        >
                          <Icon
                            as={showPassword ? FiEyeOff : FiEye}
                          />
                        </Button>
                      }
                    >
                      <Input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={user.password}
                        onChange={handleChange}
                        placeholder="Ingresa tu contraseña"
                        autoComplete="current-password"
                        bg="gray.50"
                        borderRadius="lg"
                        focusRingColor="blue.500"
                      />
                    </InputGroup>
                  </Field.Root>

                  <Button
                    type="submit"
                    size="lg"
                    colorPalette="blue"
                    borderRadius="lg"
                    loading={loading}
                    loadingText="Ingresando..."
                    mt={2}
                  >
                    Iniciar sesión
                  </Button>
                </VStack>
              </form>

              <Separator />

              <Center>
                <Text
                  fontSize="xs"
                  color="gray.500"
                  display="flex"
                  alignItems="center"
                  gap={2}
                >
                  <Icon as={FiLock} />
                  Acceso seguro a tu banca digital
                </Text>
              </Center>
            </VStack>
          </Box>
        </Box>

        <Text
          textAlign="center"
          color="gray.500"
          fontSize="xs"
          mt={5}
        >
          © {new Date().getFullYear()} Digital Banking
        </Text>
      </Container>
    </Box>
  );
}

export default Login;
