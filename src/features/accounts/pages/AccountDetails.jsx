import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  Separator,
  Spinner,
  Table,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  FiArrowDownLeft,
  FiArrowLeft,
  FiArrowUpRight,
  FiRefreshCw,
  FiSearch,
  FiCreditCard,
  FiDollarSign,
} from "react-icons/fi";

import { getAccount } from "../../../features/accounts/services/accountService.js";
import { formatMoney, formatDate } from "../../../shared/utils/formatters";

const getMovementType = (type) => {
  const types = {
    DEPOSIT: "Depósito",
    TRANSFER_OUT: "Transferencia enviada",
    TRANSFER_IN: "Transferencia recibida",
    WITHDRAWAL: "Retiro",
  };

  return types[type] || type || "Movimiento";
};

const getMovementAmount = (tx) => {
  const amount = Number(tx.amount) || 0;

  if (tx.type === "TRANSFER_OUT" || tx.type === "WITHDRAWAL") {
    return -amount;
  }

  if (tx.type === "DEPOSIT" || tx.type === "TRANSFER_IN") {
    return amount;
  }

  return amount;
};

export function Account() {
  const { accountId } = useParams();
  const navigate = useNavigate();

  const [account, setAccount] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAccount = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await getAccount(accountId);

      if (!result?.succeeded || !result.data) {
        throw new Error(
          result?.message || "No se encontró la cuenta"
        );
      }

      setAccount(result.data);
    } catch (err) {
      setError(
        err.message || "Error al consultar la cuenta"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accountId) {
      loadAccount();
    } else {
      setError("No se proporcionó un identificador de cuenta");
      setLoading(false);
    }
  }, [accountId]);

  const transactions = account?.lastTransactions ?? [];

  const filteredTransactions = useMemo(() => {
    const term = search.trim().toLowerCase();

    return transactions.filter((tx) => {
      const matchesSearch = [
        tx.description,
        tx.type,
        getMovementType(tx.type),
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(term)
      );

      const matchesFilter =
        filter === "ALL" ||
        (filter === "DEPOSIT" && tx.type === "DEPOSIT") ||
        (filter === "TRANSFER" &&
          ["TRANSFER_IN", "TRANSFER_OUT"].includes(tx.type));

      return matchesSearch && matchesFilter;
    });
  }, [transactions, search, filter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTransactions.length / pageSize)
  );

  const currentPage = Math.min(page, totalPages);

  const visibleTransactions = filteredTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleFilter = (value) => {
    setFilter(value);
    setPage(1);
  };

  if (loading) {
    return (
      <Flex
        minH="100vh"
        align="center"
        justify="center"
        direction="column"
        gap={4}
        bg="gray.100"
      >
        <Spinner size="xl" color="blue.600" />
        <Text color="gray.600">Cargando cuenta...</Text>
      </Flex>
    );
  }

  return (
    <Box minH="100vh" bg="gray.100" py={8} px={4}>
      <Container maxW="6xl">
        <VStack align="stretch" gap={6}>
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
                <Heading size="lg">Digital Banking</Heading>
                <Text color="blue.100" fontSize="sm" mt={1}>
                  Detalle de cuenta y movimientos
                </Text>
              </Box>
            </HStack>

            <HStack>
              <Button
                variant="outline"
                color="white"
                borderColor="whiteAlpha.500"
                onClick={loadAccount}
              >
                <Icon as={FiRefreshCw} />
                Actualizar
              </Button>

              <Button
                variant="outline"
                color="white"
                borderColor="whiteAlpha.500"
                onClick={() => navigate(-1)}
              >
                <Icon as={FiArrowLeft} />
                Volver
              </Button>
            </HStack>
          </Flex>

          {error ? (
            <Box bg="white" p={6} borderRadius="xl">
              <Alert.Root status="error" borderRadius="lg">
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Description>{error}</Alert.Description>
                </Alert.Content>
              </Alert.Root>
              <Button mt={4} onClick={loadAccount} colorPalette="blue">
                Reintentar
              </Button>
            </Box>
          ) : account && (
            <>
              {/* Resumen de cuenta */}
              <Box
                bg="white"
                p={{ base: 5, md: 7 }}
                borderRadius="2xl"
                boxShadow="sm"
              >
                <Text color="gray.500" fontSize="sm">
                  Saldo de la cuenta
                </Text>

                <Heading
                  size={{ base: "xl", md: "2xl" }}
                  color="blue.900"
                  mt={2}
                >
                  {formatMoney(account.balance)}
                </Heading>

                <HStack mt={3} gap={2}>
                  <Icon as={FiCreditCard} color="gray.500" />
                  <Text fontWeight="medium" color="gray.700">
                    {account.accountId}
                  </Text>
                </HStack>

                <Separator my={5} />

                <Flex gap={4} wrap="wrap">
                  <Box flex="1" minW="180px">
                    <HStack color="gray.500" gap={2}>
                      <Icon as={FiDollarSign} />
                      <Text fontSize="sm">Intereses acumulados</Text>
                    </HStack>
                    <Heading size="md" mt={2} color="green.600">
                      {formatMoney(account.totalInterest)}
                    </Heading>
                  </Box>

                  <Box flex="1" minW="180px">
                    <Text color="gray.500" fontSize="sm">
                      Movimientos recibidos
                    </Text>
                    <Heading size="md" mt={2} color="gray.800">
                      {transactions.length}
                    </Heading>
                  </Box>
                </Flex>
              </Box>

              {/* Historial */}
              <Box
                bg="white"
                borderRadius="2xl"
                boxShadow="sm"
                overflow="hidden"
              >
                <Box p={5}>
                  <Heading size="md" color="gray.800">
                    Historial de movimientos
                  </Heading>
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    Consulta los depósitos y las transferencias de tu cuenta.
                  </Text>

                  <Box mt={4}>
                    <InputGroup
                      startElement={
                        <Icon as={FiSearch} color="gray.400" />
                      }
                    >
                      <Input
                        placeholder="Buscar por descripción o tipo..."
                        value={search}
                        onChange={(event) =>
                          handleSearch(event.target.value)
                        }
                        bg="gray.50"
                      />
                    </InputGroup>
                  </Box>

                  <Flex mt={4} gap={2} wrap="wrap">
                    {[
                      { value: "ALL", label: "Todos" },
                      { value: "DEPOSIT", label: "Depósitos" },
                      { value: "TRANSFER", label: "Transferencias" },
                    ].map((option) => (
                      <Button
                        key={option.value}
                        size="sm"
                        variant={
                          filter === option.value ? "solid" : "outline"
                        }
                        colorPalette="blue"
                        onClick={() => handleFilter(option.value)}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </Flex>
                </Box>

                {filteredTransactions.length === 0 ? (
                  <VStack py={10} px={5}>
                    <Icon as={FiSearch} boxSize={8} color="gray.400" />
                    <Text color="gray.600">
                      No se encontraron movimientos.
                    </Text>
                  </VStack>
                ) : (
                  <>
                    <Box overflowX="auto">
                      <Table.Root size="md" striped>
                        <Table.Header>
                          <Table.Row bg="gray.50">
                            <Table.ColumnHeader>
                              Movimiento
                            </Table.ColumnHeader>
                            <Table.ColumnHeader>
                              Fecha
                            </Table.ColumnHeader>
                            <Table.ColumnHeader textAlign="end">
                              Importe
                            </Table.ColumnHeader>
                          </Table.Row>
                        </Table.Header>

                        <Table.Body>
                          {visibleTransactions.map((tx, index) => {
                            const amount = getMovementAmount(tx);
                            const positive = amount >= 0;

                            return (
                              <Table.Row key={`${tx.date}-${index}`}>
                                <Table.Cell>
                                  <HStack gap={3}>
                                    <Box
                                      p={2}
                                      borderRadius="lg"
                                      bg={positive ? "green.50" : "red.50"}
                                    >
                                      <Icon
                                        as={
                                          positive
                                            ? FiArrowDownLeft
                                            : FiArrowUpRight
                                        }
                                        color={
                                          positive ? "green.600" : "red.600"
                                        }
                                        boxSize={5}
                                      />
                                    </Box>

                                    <Box>
                                      <Text
                                        fontWeight="medium"
                                        color="gray.800"
                                      >
                                        {tx.description || "Movimiento"}
                                      </Text>
                                      <Text fontSize="xs" color="gray.500">
                                        {getMovementType(tx.type)}
                                      </Text>
                                    </Box>
                                  </HStack>
                                </Table.Cell>

                                <Table.Cell>
                                  <Text fontSize="sm" color="gray.600">
                                    {formatDate(tx.date)}
                                  </Text>
                                </Table.Cell>

                                <Table.Cell textAlign="end">
                                  <Text
                                    fontWeight="semibold"
                                    color={positive ? "green.600" : "red.600"}
                                    whiteSpace="nowrap"
                                  >
                                    {positive ? "+" : "−"}
                                    {formatMoney(Math.abs(amount))}
                                  </Text>
                                </Table.Cell>
                              </Table.Row>
                            );
                          })}
                        </Table.Body>
                      </Table.Root>
                    </Box>

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
                          de {filteredTransactions.length}
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
                          aria-label="Página anterior"
                        >
                          Anterior
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={currentPage >= totalPages}
                          onClick={() => setPage(currentPage + 1)}
                          aria-label="Página siguiente"
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
  );
}

export default Account;
