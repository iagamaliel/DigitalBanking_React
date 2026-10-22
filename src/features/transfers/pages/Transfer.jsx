import { useEffect, useMemo, useState } from "react";
import { Header } from "../../../shared/components/Header.jsx";
import { useNavigate } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Icon,
  Input,
  NativeSelect,
  Separator,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";

import {
  FiRepeat,
  FiCreditCard,
  FiDollarSign,
  FiRefreshCw,
  FiShield,
  FiCheckCircle,
} from "react-icons/fi";

import {transferFunds } from "../../../features/transfers/services/transferService.js";
import { getAccountsByCustomerId } from "../../../features/accounts/services/accountService.js";

const money = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value) || 0);

export function Transfer() {
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);
  const [fromAccountId, setFromAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [transferType, setTransferType] = useState("OWN");
  const [amount, setAmount] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  const userData = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem("userData") || "null");
    } catch {
      return null;
    }
  }, []);

  const customerId =
    userData?.data?.customerId ?? userData?.customerId;

  const loadAccounts = async () => {
    if (customerId == null || customerId === "") {
      setError("No se encontró el cliente de la sesión.");
      setAccounts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await getAccountsByCustomerId(customerId);

      if (!result?.succeeded) {
        throw new Error(
          result?.message || "No se pudieron cargar tus cuentas."
        );
      }

      const customerAccounts = Array.isArray(result.data)
        ? result.data
        : [];

      setAccounts(customerAccounts);

      setFromAccountId((current) => {
        if (
          current &&
          customerAccounts.some((a) => a.accountId === current)
        ) {
          return current;
        }

        return customerAccounts[0]?.accountId ?? "";
      });
    } catch (err) {
      setError(err.message || "Error al consultar las cuentas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, [customerId]);

  const sourceAccount = accounts.find(
    (account) => account.accountId === fromAccountId
  );

  const isOwnDestination = accounts.some(
    (account) =>
      String(account.accountId).toLowerCase() ===
      toAccountId.trim().toLowerCase()
  );

  const numericAmount = Number(amount);

  const handleTransfer = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess(null);

    if (!sourceAccount) {
      setError("Selecciona una cuenta de origen.");
      return;
    }

    if (!toAccountId.trim()) {
      setError("Ingresa la cuenta de destino.");
      return;
    }

    if (
      fromAccountId.toLowerCase() ===
      toAccountId.trim().toLowerCase()
    ) {
      setError("La cuenta de origen y destino deben ser diferentes.");
      return;
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Ingresa un monto válido mayor que cero.");
      return;
    }

    if (numericAmount > Number(sourceAccount.balance)) {
      setError("El monto supera el saldo disponible.");
      return;
    }

    if (transferType === "OWN" && !isOwnDestination) {
      setError(
        "Para transferir entre tus cuentas, selecciona otra cuenta tuya."
      );
      return;
    }

    try {
      setSubmitting(true);

      const result = await transferFunds({
        fromAccountId,
        toAccountId: toAccountId.trim(),
        amount: numericAmount,
      });

      setSuccess(result.data);
      setAmount("");
      setToAccountId("");

      // Actualizar los saldos después de transferir.
      await loadAccounts();
    } catch (err) {
      setError(err.message || "No se pudo realizar la transferencia.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Flex
        minH="60vh"
        align="center"
        justify="center"
        direction="column"
        gap={4}
      >
        <Spinner size="xl" color="blue.600" />
        <Text color="gray.600">Cargando tus cuentas...</Text>
      </Flex>
    );
  }

  return (
    <>
    <Header />
    <Box minH="100vh" bg="gray.100" py={8} px={4}>
      <Container maxW="6xl">
        <VStack align="stretch" gap={6}>
          {/* Encabezado con la misma línea gráfica de Mis cuentas */}
          <Flex
            bg="blue.900"
            color="white"
            p={{ base: 5, md: 7 }}
            borderRadius="2xl"
            justify="space-between"
            align="center"
            gap={4}
            wrap="wrap"
          >
            <HStack gap={3}>
              <Box bg="whiteAlpha.200" p={3} borderRadius="xl">
                <Icon as={FiRepeat} boxSize={7} />
              </Box>

              <Box>
                <Heading size="lg">Transferencia de fondos</Heading>
                <Text color="blue.100" fontSize="sm" mt={1}>
                  Envía dinero de forma sencilla y segura
                </Text>
              </Box>
            </HStack>

            <HStack gap={2} wrap="wrap">
              <Button
                variant="outline"
                color="white"
                borderColor="whiteAlpha.500"
                onClick={() => navigate("/accounts")}
              >
                <Icon as={FiCreditCard} />
                Mis cuentas
              </Button>

              <Button
                variant="outline"
                color="white"
                borderColor="whiteAlpha.500"
                onClick={loadAccounts}
                disabled={submitting}
              >
                <Icon as={FiRefreshCw} />
                Actualizar
              </Button>
            </HStack>
          </Flex>

          {error && (
            <Box bg="white" p={5} borderRadius="xl">
              <Alert.Root status="error">
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Description>{error}</Alert.Description>
                </Alert.Content>
              </Alert.Root>
            </Box>
          )}

          {success && (
            <Box bg="white" p={5} borderRadius="xl" boxShadow="sm">
              <Alert.Root status="success">
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Title>Transferencia completada</Alert.Title>
                  <Alert.Description>
                    {success.message}
                    <br />
                    Origen: {success.fromAccount}
                    <br />
                    Destino: {success.toAccount}
                    <br />
                    Monto: {money(success.amount)}
                  </Alert.Description>
                </Alert.Content>
              </Alert.Root>
            </Box>
          )}

          {accounts.length === 0 ? (
            <Box bg="white" p={8} borderRadius="xl" textAlign="center">
              <Icon as={FiCreditCard} boxSize={9} color="gray.400" />
              <Heading size="md" mt={3}>
                No hay cuentas disponibles
              </Heading>
              <Text color="gray.500" mt={2}>
                No encontramos cuentas asociadas a tu cliente.
              </Text>
              <Button
                mt={4}
                colorPalette="blue"
                onClick={loadAccounts}
              >
                Reintentar
              </Button>
            </Box>
          ) : (
            <Flex align="start" gap={6} wrap="wrap">
              {/* Formulario */}
              <Box
                flex="1"
                minW={{ base: "100%", md: "400px" }}
                bg="white"
                p={{ base: 5, md: 7 }}
                borderRadius="2xl"
                boxShadow="sm"
              >
                <HStack gap={3} mb={6}>
                  <Box bg="blue.50" color="blue.600" p={3} borderRadius="xl">
                    <Icon as={FiRepeat} boxSize={5} />
                  </Box>
                  <Box>
                    <Heading size="md">Datos de la transferencia</Heading>
                    <Text color="gray.500" fontSize="sm" mt={1}>
                      Completa los datos de la operación.
                    </Text>
                  </Box>
                </HStack>

                <form onSubmit={handleTransfer}>
                  <VStack align="stretch" gap={5}>
                    <Box>
                      <Text fontWeight="medium" fontSize="sm" mb={2}>
                        Tipo de transferencia
                      </Text>

                      <NativeSelect.Root>
                        <NativeSelect.Field
                          value={transferType}
                          onChange={(e) => setTransferType(e.target.value)}
                        >
                          <option value="OWN">Entre mis cuentas</option>
                          <option value="THIRD_PARTY">
                            A terceros — mismo banco
                          </option>
                        </NativeSelect.Field>
                        <NativeSelect.Indicator />
                      </NativeSelect.Root>

                      <Text color="gray.500" fontSize="xs" mt={2}>
                        {transferType === "OWN"
                          ? "El destino debe ser otra cuenta tuya."
                          : "Ingresa la cuenta de otro cliente del banco."}
                      </Text>
                    </Box>

                    <Box>
                      <Text fontWeight="medium" fontSize="sm" mb={2}>
                        Cuenta de origen
                      </Text>

                      <NativeSelect.Root>
                        <NativeSelect.Field
                          value={fromAccountId}
                          onChange={(e) => setFromAccountId(e.target.value)}
                        >
                          {accounts.map((account) => (
                            <option
                              key={account.accountId}
                              value={account.accountId}
                            >
                              {account.accountId} — {money(account.balance)}
                            </option>
                          ))}
                        </NativeSelect.Field>
                        <NativeSelect.Indicator />
                      </NativeSelect.Root>

                      <HStack mt={2} color="gray.500" gap={2}>
                        <Icon as={FiDollarSign} />
                        <Text fontSize="sm">
                          Saldo disponible: {money(sourceAccount?.balance)}
                        </Text>
                      </HStack>
                    </Box>

                    <Box>
                      <Text fontWeight="medium" fontSize="sm" mb={2}>
                        Cuenta de destino
                      </Text>
                      <Input
                        value={toAccountId}
                        onChange={(e) => setToAccountId(e.target.value)}
                        placeholder="Ej. ACC1002"
                        bg="gray.50"
                        required
                      />
                    </Box>

                    <Box>
                      <Text fontWeight="medium" fontSize="sm" mb={2}>
                        Monto a transferir (USD)
                      </Text>
                      <Input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        bg="gray.50"
                        required
                      />
                    </Box>

                    <Separator />

                    <Button
                      type="submit"
                      colorPalette="blue"
                      size="lg"
                      w="full"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Spinner size="sm" />
                          Procesando...
                        </>
                      ) : (
                        <>
                          <Icon as={FiRepeat} />
                          Realizar transferencia
                        </>
                      )}
                    </Button>

                    <HStack justify="center" color="gray.500" gap={2}>
                      <Icon as={FiShield} />
                      <Text fontSize="xs">
                        La operación será validada por el banco.
                      </Text>
                    </HStack>
                  </VStack>
                </form>
              </Box>

              {/* Resumen lateral */}
              <VStack
                align="stretch"
                w={{ base: "100%", lg: "310px" }}
                gap={4}
              >
                <Box
                  bg="white"
                  p={6}
                  borderRadius="xl"
                  boxShadow="sm"
                >
                  <HStack color="gray.500" gap={2}>
                    <Icon as={FiDollarSign} />
                    <Text fontSize="sm">Monto de la transferencia</Text>
                  </HStack>

                  <Heading size="2xl" color="blue.900" mt={3}>
                    {money(numericAmount)}
                  </Heading>

                  <Text fontSize="xs" color="gray.500" mt={2}>
                    Dólares estadounidenses
                  </Text>
                </Box>

                <Box
                  bg="white"
                  p={6}
                  borderRadius="xl"
                  boxShadow="sm"
                >
                  <Heading size="md">Resumen</Heading>

                  <VStack align="stretch" gap={4} mt={5}>
                    <Box>
                      <Text color="gray.500" fontSize="xs">
                        Modalidad
                      </Text>
                      <Text fontWeight="medium">
                        {transferType === "OWN"
                          ? "Entre mis cuentas"
                          : "A terceros — mismo banco"}
                      </Text>
                    </Box>

                    <Box>
                      <Text color="gray.500" fontSize="xs">
                        Cuenta de origen
                      </Text>
                      <Text fontWeight="medium" overflowWrap="anywhere">
                        {fromAccountId || "—"}
                      </Text>
                    </Box>

                    <Box>
                      <Text color="gray.500" fontSize="xs">
                        Cuenta de destino
                      </Text>
                      <Text fontWeight="medium" overflowWrap="anywhere">
                        {toAccountId || "Pendiente"}
                      </Text>
                    </Box>

                    <Separator />

                    <HStack align="start" gap={3} color="green.600">
                      <Icon as={FiCheckCircle} boxSize={5} mt={1} />
                      <Text fontSize="sm">
                        Verifica la cuenta destino y el monto antes de enviar.
                      </Text>
                    </HStack>
                  </VStack>
                </Box>
              </VStack>
            </Flex>
          )}
        </VStack>
      </Container>
    </Box>
    </>
  );
}

export default Transfer;
