import React from 'react';
import { OrgChart, OrgLevel } from '@/components/ui/org-chart';
import { OrgChartNode } from '@/components/ui/org-chart-node';
import { useApp } from '@/contexts/AppContext';

const HierarchyOrgChart: React.FC = () => {
  const { state } = useApp();

  // Organizando funcionários por hierarquia
  const socios = state.employees.filter(emp => emp.position?.toLowerCase().includes('sócio') || emp.position?.toLowerCase().includes('socio'));
  const diretoresExecutivos = state.employees.filter(emp => emp.position?.toLowerCase().includes('diretor executivo'));
  const diretores = state.employees.filter(emp => 
    emp.position?.toLowerCase().includes('diretor') && 
    !emp.position?.toLowerCase().includes('diretor executivo')
  );
  const gerentes = state.employees.filter(emp => emp.isManager && emp.position?.toLowerCase().includes('gerente'));
  const coordenadores = state.employees.filter(emp => emp.position?.toLowerCase().includes('coordenador'));

  return (
    <OrgChart title="Organograma Hierárquico Completo">
      <div className="space-y-16">
        {/* Nível Sócios */}
        {socios.length > 0 && (
          <OrgLevel>
            <h2 className="text-xl font-bold text-center text-primary mb-8 w-full">SÓCIOS</h2>
            <div className="flex justify-center gap-8 w-full">
              {socios.map((socio, index) => (
                <OrgChartNode
                  key={socio.id}
                  name={socio.name}
                  title={socio.position}
                  level="socio"
                />
              ))}
            </div>
          </OrgLevel>
        )}

        {/* Nível Diretor Executivo */}
        {diretoresExecutivos.length > 0 && (
          <OrgLevel>
            <h2 className="text-xl font-bold text-center text-blue-600 mb-8 w-full">DIRETORIA EXECUTIVA</h2>
            <div className="flex justify-center gap-8 w-full">
              {diretoresExecutivos.map((diretor, index) => (
                <OrgChartNode
                  key={diretor.id}
                  name={diretor.name}
                  title={diretor.position}
                  level="diretor-executivo"
                />
              ))}
            </div>
          </OrgLevel>
        )}

        {/* Nível Diretoria */}
        {diretores.length > 0 && (
          <OrgLevel>
            <h2 className="text-xl font-bold text-center text-primary mb-8 w-full">DIRETORIA</h2>
            <div className="flex justify-center gap-8 w-full">
              {diretores.map((diretor, index) => (
                <OrgChartNode
                  key={diretor.id}
                  name={diretor.name}
                  title={diretor.position}
                  level="diretoria"
                />
              ))}
            </div>
          </OrgLevel>
        )}

        {/* Nível Gerência */}
        {gerentes.length > 0 && (
          <OrgLevel>
            <h2 className="text-xl font-bold text-center text-secondary mb-8 w-full">GERÊNCIA</h2>
            <div className="flex justify-center gap-8 w-full flex-wrap">
              {gerentes.map((gerente, index) => (
                <OrgChartNode
                  key={gerente.id}
                  name={gerente.name}
                  title={gerente.position}
                  level="gerencia"
                />
              ))}
            </div>
          </OrgLevel>
        )}

        {/* Nível Coordenação */}
        {coordenadores.length > 0 && (
          <OrgLevel>
            <h2 className="text-xl font-bold text-center text-accent mb-8 w-full">COORDENAÇÃO</h2>
            <div className="flex justify-center gap-8 w-full flex-wrap">
              {coordenadores.map((coordenador, index) => (
                <OrgChartNode
                  key={coordenador.id}
                  name={coordenador.name}
                  title={coordenador.position}
                  level="coordenacao"
                />
              ))}
            </div>
          </OrgLevel>
        )}

        {/* Departamentos */}
        {state.departments.filter(dept => dept.visible !== false).length > 0 && (
          <OrgLevel>
            <h2 className="text-xl font-bold text-center text-muted-foreground mb-8 w-full">DEPARTAMENTOS</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
              {state.departments
                .filter(dept => dept.visible !== false)
                .map((department) => {
                  const deptEmployees = state.employees.filter(emp => emp.department === department.name);
                  return (
                    <OrgChartNode
                      key={department.id}
                      title={department.name}
                      level="funcionario"
                      count={deptEmployees.length}
                    />
                  );
                })}
            </div>
          </OrgLevel>
        )}

        {/* Organograma vazio */}
        {state.employees.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              Nenhum funcionário cadastrado ainda.
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              Configure o Google Sheets ou adicione funcionários no painel administrativo.
            </p>
          </div>
        )}
      </div>
    </OrgChart>
  );
};

export default HierarchyOrgChart;