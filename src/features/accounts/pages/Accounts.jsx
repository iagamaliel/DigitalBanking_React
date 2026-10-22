import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../../../shared/components/Header.jsx";

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
  InputGroup,
  Spinner,
  Table,
  Text,
  VStack
} from "@chakra-ui/react";

import {
  FiCreditCard,
  FiEye,
  FiRefreshCw,
  FiSearch,
  FiDollarSign
} from "react-icons/fi";

import { getAccountsByCustomerId } from "../../../features/accounts/services/accountService.js";
import { formatMoney, formatDate } from "../../../shared/utils/formatters";

export function Accounts() {
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Obtener el CustomerId de la sesión iniciada.
  const userData = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem("userData") || "null");
    } catch {
      return null;
    }
  }, []);

  const customerId =
    userData?.data?.customerId ??
    userData?.customerId;

  const loadAccounts = async () => {
    if (customerId == null || customerId === "") {
      setError(
        "No se encontró el identificador del cliente en la sesión."
      );
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
          result?.message || "No se pudieron obtener las cuentas."
        );
      }

      setAccounts(
        Array.isArray(result.data) ? result.data : []
      );
    } catch (err) {
      setError(
        err.message || "Error al consultar las cuentas."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, [customerId]);

  const filteredAccounts = useMemo(() => {
    const term = search.trim().toLowerCase();

    return accounts.filter((account) =>
      String(account.accountId ?? "")
        .toLowerCase()
        .includes(term)
    );
  }, [accounts, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAccounts.length / pageSize)
  );

  const currentPage = Math.min(page, totalPages);

  const visibleAccounts = filteredAccounts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalBalance = accounts.reduce(
    (total, account) =>
      total + (Number(account.balance) || 0),
    0
  );

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
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
        <Text color="gray.600">Cargando cuentas...</Text>
      </Flex>
    );
  }

  return (
    <>
    <Header />
    <Box minH="100vh" bg="gray.100" py={8} px={4}>
      <Container maxW="6xl">
        <VStack align="stretch" gap={6}>

          {/* Encabezado */}
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
                <Icon as={FiCreditCard} boxSize={7} />
              </Box>

              <Box>
                <Heading size="lg">Mis cuentas</Heading>
                <Text color="blue.100" fontSize="sm" mt={1}>
                  Consulta tus cuentas bancarias
                </Text>
              </Box>
            </HStack>

            <Button
              variant="outline"
              color="white"
              borderColor="whiteAlpha.500"
              onClick={loadAccounts}
            >
              <Icon as={FiRefreshCw} />
              Actualizar
            </Button>
          </Flex>

          {/* Error */}
          {error && (
            <Box bg="white" p={5} borderRadius="xl">
              <Alert.Root status="error">
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Description>{error}</Alert.Description>
                </Alert.Content>
              </Alert.Root>

              <Button
                mt={4}
                colorPalette="blue"
                onClick={loadAccounts}
              >
                Reintentar
              </Button>
            </Box>
          )}

          {!error && (
            <>
              {/* Resumen */}
              <Flex gap={4} wrap="wrap">
                <Box
                  flex="1"
                  minW="220px"
                  bg="white"
                  p={6}
                  borderRadius="xl"
                  boxShadow="sm"
                >
                  <HStack color="gray.500" gap={2}>
                    <Icon as={FiCreditCard} />
                    <Text fontSize="sm">Total de cuentas</Text>
                  </HStack>

                  <Heading size="xl" color="blue.900" mt={3}>
                    {accounts.length}
                  </Heading>
                </Box>

                <Box
                  flex="1"
                  minW="220px"
                  bg="white"
                  p={6}
                  borderRadius="xl"
                  boxShadow="sm"
                >
                  <HStack color="gray.500" gap={2}>
                    <Icon as={FiDollarSign} />
                    <Text fontSize="sm">Saldo total</Text>
                  </HStack>

                  <Heading size="xl" color="green.600" mt={3}>
                    {formatMoney(totalBalance)}
                  </Heading>
                </Box>
              </Flex>

              {/* Tabla */}
              <Box
                bg="white"
                borderRadius="2xl"
                boxShadow="sm"
                overflow="hidden"
              >
                <Box p={5}>
                  <Heading size="md" color="gray.800">
                    Cuentas bancarias
                  </Heading>

                  <Text color="gray.500" fontSize="sm" mt={1}>
                    Selecciona una cuenta para ver su detalle y movimientos.
                  </Text>

                  <Box mt={4}>
                    <InputGroup
                      startElement={
                        <Icon as={FiSearch} color="gray.400" />
                      }
                    >
                      <Input
                        placeholder="Buscar por número de cuenta..."
                        value={search}
                        onChange={(event) =>
                          handleSearch(event.target.value)
                        }
                        bg="gray.50"
                      />
                    </InputGroup>
                  </Box>
                </Box>

                {filteredAccounts.length === 0 ? (
                  <VStack py={10} px={5}>
                    <Icon
                      as={FiSearch}
                      boxSize={8}
                      color="gray.400"
                    />
                    <Text color="gray.600">
                      {accounts.length === 0
                        ? "Este cliente no tiene cuentas registradas."
                        : "No se encontraron cuentas."}
                    </Text>
                  </VStack>
                ) : (
                  <>
                    <Box overflowX="auto">
                      <Table.Root size="md" striped>
                        <Table.Header>
                          <Table.Row bg="gray.50">
                            <Table.ColumnHeader>
                              Número de cuenta
                            </Table.ColumnHeader>

                            <Table.ColumnHeader>
                              Fecha de creación
                            </Table.ColumnHeader>

                            <Table.ColumnHeader textAlign="end">
                              Saldo
                            </Table.ColumnHeader>

                            <Table.ColumnHeader textAlign="center">
                              Acción
                            </Table.ColumnHeader>
                          </Table.Row>
                        </Table.Header>

                        <Table.Body>
                          {visibleAccounts.map((account) => (
                            <Table.Row key={account.accountId}>
                              <Table.Cell>
                                <HStack gap={3}>
                                  <Box
                                    bg="blue.50"
                                    color="blue.600"
                                    p={2}
                                    borderRadius="lg"
                                  >
                                    <Icon as={FiCreditCard} boxSize={5} />
                                  </Box>

                                  <Text fontWeight="medium">
                                    {account.accountId}
                                  </Text>
                                </HStack>
                              </Table.Cell>

                              <Table.Cell>
                                <Text color="gray.600" fontSize="sm">
                                  {formatDate(account.createdDate)}
                                </Text>
                              </Table.Cell>

                              <Table.Cell textAlign="end">
                                <Text
                                  fontWeight="semibold"
                                  color="gray.800"
                                  whiteSpace="nowrap"
                                >
                                  {formatMoney(account.balance)}
                                </Text>
                              </Table.Cell>

                              <Table.Cell textAlign="center">
                                <Button
                                  size="sm"
                                  colorPalette="blue"
                                  variant="outline"
                                  onClick={() =>
                                    navigate(
                                      `/accounts/${encodeURIComponent(account.accountId)}`
                                    )
                                  }
                                >
                                  <Icon as={FiEye} />
                                  Ver detalle
                                </Button>
                              </Table.Cell>
                            </Table.Row>
                          ))}
                        </Table.Body>
                      </Table.Root>
                    </Box>

                    {/* Paginación */}
                    <Flex
                      p={4}
                      borderTopWidth="1px"
                      borderColor="gray.100"
                      justify="space-between"
                      align="center"
                      gap={3}
                      wrap="wrap"
                    >
                      <HStack gap={2}>
                        <Text fontSize="sm" color="gray.600">
                          Mostrar
                        </Text>

                        <Box
                          as="select"
                          value={pageSize}
                          onChange={(event) => {
                            setPageSize(Number(event.target.value));
                            setPage(1);
                          }}
                          borderWidth="1px"
                          borderColor="gray.200"
                          borderRadius="md"
                          p={2}
                          bg="white"
                          fontSize="sm"
                        >
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                        </Box>

                        <Text fontSize="sm" color="gray.500">
                          de {filteredAccounts.length}
                        </Text>
                      </HStack>

                      <HStack gap={3}>
                        <Text fontSize="sm" color="gray.600">
                          Página {currentPage} de {totalPages}
                        </Text>

                        <Button
                          size="sm"
                          variant="outline"
                          disabled={currentPage <= 1}
                          onClick={() => setPage(currentPage - 1)}
                        >
                          Anterior
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          disabled={currentPage >= totalPages}
                          onClick={() => setPage(currentPage + 1)}
                        >
                          Siguiente
                        </Button>
                      </HStack>
                    </Flex>
                  </>
                )}
              </Box>
            </>
          )}
        </VStack>
      </Container>
    </Box>
    </>
  );
}

export default Accounts;
